package com.geomsahaejo.scorecard.job;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 100)
    private String jobName;

    @Column(nullable = false)
    private String originalFilename;

    @Column(length = 500)
    private String purpose;

    @Column(nullable = false, length = 500)
    private String s3Key;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private DataType dataType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status;

    // 재진단(retry)인 경우 부모 Job 의 id. 1차 진단이면 null.
    @Column
    private Long parentJobId;

    // 진단 요청 시점의 가중치 스냅샷 (JSON). 재진단 시 부모로부터 동일하게 복사.
    @Column(length = 2000)
    private String weightsJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static Job create(Long userId, String jobName, String originalFilename,
                             String purpose, String s3Key, String weightsJson) {
        Job job = new Job();
        job.userId = userId;
        job.jobName = jobName;
        job.originalFilename = originalFilename;
        job.purpose = purpose;
        job.s3Key = s3Key;
        job.weightsJson = weightsJson;
        job.status = JobStatus.PENDING;
        return job;
    }

    public static Job createRetry(Job parent, Long userId, String jobName,
                                  String originalFilename, String s3Key) {
        Job job = new Job();
        job.userId = userId;
        job.jobName = jobName;
        job.originalFilename = originalFilename;
        // weights/purpose 는 부모에서 그대로 승계 (재진단 의미상 동일 조건 유지)
        job.purpose = parent.purpose;
        job.weightsJson = parent.weightsJson;
        job.s3Key = s3Key;
        job.parentJobId = parent.getId();
        job.status = JobStatus.PENDING;
        return job;
    }

    public void updateStatus(JobStatus status) {
        this.status = status;
    }

    public void updateDataType(DataType dataType) {
        this.dataType = dataType;
    }
}
