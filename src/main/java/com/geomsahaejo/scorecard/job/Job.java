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

    @Column(nullable = false)
    private String originalFilename;

    @Column(nullable = false, length = 500)
    private String s3Key;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private DataType dataType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status;

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

    public static Job create(Long userId, String originalFilename, String s3Key) {
        Job job = new Job();
        job.userId = userId;
        job.originalFilename = originalFilename;
        job.s3Key = s3Key;
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
