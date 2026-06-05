"""업로드 파일 → 엔진 입력 변환 어댑터 (비정형).

팀원 엔진은 in-memory 컬렉션을 기대하므로, S3에 올라온 업로드 파일을 풀어
(images, labels) / (texts, labels)로 만드는 책임은 웹 측(우리)에 있다.

라벨 관례 (엔진의 정수 라벨 요구 + 팀원 torchvision 생태계 표준에 근거):
- 이미지: 클래스명 폴더 ZIP (cats/  dogs/ ...). 최상위 폴더명을 정렬해 0..N-1 정수로 매핑
  (torchvision ImageFolder 관례). 폴더 없는 평면 ZIP은 단일 클래스로 처리.
- 텍스트: CSV의 텍스트 열 + 라벨 열. 라벨 열을 pandas.factorize로 정수화.
"""
from __future__ import annotations

import io
import zipfile

from worker import S3_BUCKET

_IMAGE_EXTS = ('.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp', '.tiff')

# S3 Range 읽기 블록 크기(바이트). 배치 엔트리가 ZIP에 순차 저장되어 순차로 읽히므로
# 1MB 블록이면 한 블록이 수십 장을 커버해 S3 호출 수를 줄인다. 테스트에서 축소 주입 가능.
_S3_BLOCK = 1 << 20


# =====================================================================
# S3 Range 읽기 — ZIP 전체를 메모리에 올리지 않고 필요한 바이트만 읽는다.
# stdlib zipfile에 seekable 파일객체로 넘기면 중앙디렉토리·요청 엔트리만 range로 읽어,
# 363MB~수십GB ZIP도 워커 메모리/다운로드가 전체 크기에 비례하지 않는다(정형 byte-range와 동일 철학).
# =====================================================================

class S3RangeReader(io.RawIOBase):
    """S3 객체를 Range GET으로 읽는 seekable 파일객체.

    block_size 단위 버퍼링으로 zipfile의 잦은 small-read를 묶어 호출 수를 줄인다.
    bytes_read: 실제 S3에서 받은 누적 바이트(전체 미적재 정량 검증용).
    """

    def __init__(self, s3, key, bucket=S3_BUCKET, block_size=None):
        self._s3 = s3
        self._bucket = bucket
        self._key = key
        self._size = int(s3.head_object(Bucket=bucket, Key=key)['ContentLength'])
        self._pos = 0
        self._block = block_size or _S3_BLOCK
        self._buf = b''
        self._buf_start = -1
        self.bytes_read = 0

    def seekable(self):
        return True

    def readable(self):
        return True

    def tell(self):
        return self._pos

    def seek(self, offset, whence=io.SEEK_SET):
        if whence == io.SEEK_SET:
            self._pos = offset
        elif whence == io.SEEK_CUR:
            self._pos += offset
        elif whence == io.SEEK_END:
            self._pos = self._size + offset
        else:
            raise ValueError(f'invalid whence: {whence}')
        return self._pos

    def _fetch(self, start, end):
        """[start, end] inclusive 바이트를 S3 Range GET. 범위 밖이면 빈 bytes."""
        if start >= self._size:
            return b''
        end = min(end, self._size - 1)
        if start > end:
            return b''
        body = self._s3.get_object(
            Bucket=self._bucket, Key=self._key,
            Range=f'bytes={start}-{end}')['Body'].read()
        self.bytes_read += len(body)
        return body

    def read(self, size=-1):
        if self._pos >= self._size:
            return b''
        if size is None or size < 0:
            data = self._fetch(self._pos, self._size - 1)
            self._pos += len(data)
            return data
        end = min(self._pos + size, self._size)
        out = bytearray()
        while self._pos < end:
            if not (self._buf_start <= self._pos < self._buf_start + len(self._buf)):
                bstart = (self._pos // self._block) * self._block
                self._buf = self._fetch(bstart, bstart + self._block - 1)
                self._buf_start = bstart
                if not self._buf:
                    break
            off = self._pos - self._buf_start
            take = min(len(self._buf) - off, end - self._pos)
            out += self._buf[off:off + take]
            self._pos += take
        return bytes(out)

    def readinto(self, b):
        data = self.read(len(b))
        n = len(data)
        b[:n] = data
        return n


# =====================================================================
# 이미지: 클래스 폴더 ZIP
# =====================================================================

def _is_image_entry(name: str) -> bool:
    if name.endswith('/') or '__MACOSX' in name or name.startswith('.'):
        return False
    base = name.rsplit('/', 1)[-1]
    if base.startswith('.'):
        return False
    return name.lower().endswith(_IMAGE_EXTS)


def _class_of(name: str) -> str:
    """ZIP 엔트리 경로의 최상위 폴더명 = 클래스. 폴더 없으면 단일 클래스."""
    parts = [p for p in name.split('/') if p]
    return parts[0] if len(parts) >= 2 else '_unlabeled'


def image_index(s3, s3_key):
    """ZIP 중앙디렉토리를 읽어 (entries, class_names) 구성.

    entries: [(zip_entry_name, label_int), ...]  (정렬된 클래스명 → 0..N-1)
    class_names: [class0, class1, ...]            (label_int 순서)
    """
    with zipfile.ZipFile(S3RangeReader(s3, s3_key)) as zf:
        names = [n for n in zf.namelist() if _is_image_entry(n)]
    if not names:
        raise ValueError('ZIP에서 이미지 파일을 찾지 못했습니다.')
    class_names = sorted({_class_of(n) for n in names})
    label_of = {c: i for i, c in enumerate(class_names)}
    entries = [(n, label_of[_class_of(n)]) for n in sorted(names)]
    return entries, class_names


def decode_image_entries(s3, s3_key, entries):
    """주어진 ZIP 엔트리 subset을 PIL 이미지로 디코딩 → (images, labels).

    디코딩 실패 항목은 건너뜀(해당 배치 validity 신호 일부 손실 — v1 한계).
    """
    from PIL import Image
    images, labels = [], []
    with zipfile.ZipFile(S3RangeReader(s3, s3_key)) as zf:
        for name, label in entries:
            try:
                data = zf.read(name)
                img = Image.open(io.BytesIO(data))
                img.load()
                images.append(img)
                labels.append(int(label))
            except Exception:
                continue
    return images, labels


# =====================================================================
# 텍스트: CSV 텍스트 열 + 라벨 열
# =====================================================================

_LABEL_CANDIDATES = ('label', 'target', 'class', 'y', 'category', 'sentiment')


def resolve_text_columns(df, text_column=None, label_column=None):
    """텍스트 열 / 라벨 열 결정 (메시지 지정 우선, 없으면 휴리스틱)."""
    cols = list(df.columns)
    # 라벨 열: 지정 > 후보명 > 마지막 열
    if label_column is None:
        label_column = next((c for c in cols if str(c).lower() in _LABEL_CANDIDATES), None)
        if label_column is None:
            label_column = cols[-1]
    # 텍스트 열: 지정 > object 열 중 평균 길이 최대 (라벨 열 제외)
    if text_column is None:
        obj_cols = [c for c in cols if c != label_column and df[c].dtype == object]
        if not obj_cols:
            obj_cols = [c for c in cols if c != label_column]
        if not obj_cols:
            raise ValueError('텍스트 열을 찾지 못했습니다.')
        text_column = max(obj_cols, key=lambda c: df[c].astype(str).str.len().mean())
    return text_column, label_column


def load_text(df, text_column=None, label_column=None, task='classification'):
    """DataFrame → (texts, labels_or_targets, class_names, text_col, label_col, task).

    classification: 라벨 열을 factorize로 정수화 (class_names = 원본 카테고리).
    regression:     라벨 열을 float로 (class_names = None).
    """
    text_col, label_col = resolve_text_columns(df, text_column, label_column)
    texts = df[text_col].astype(str).tolist()
    if task == 'regression':
        targets = df[label_col].astype(float).tolist()
        return texts, targets, None, text_col, label_col, 'regression'
    codes, uniques = df[label_col].factorize()
    labels = [int(x) for x in codes]
    class_names = [str(u) for u in uniques.tolist()]
    return texts, labels, class_names, text_col, label_col, 'classification'
