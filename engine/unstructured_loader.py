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
    raw = s3.get_object(Bucket=S3_BUCKET, Key=s3_key)['Body'].read()
    with zipfile.ZipFile(io.BytesIO(raw)) as zf:
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
    raw = s3.get_object(Bucket=S3_BUCKET, Key=s3_key)['Body'].read()
    images, labels = [], []
    with zipfile.ZipFile(io.BytesIO(raw)) as zf:
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
