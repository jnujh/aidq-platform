package com.geomsahaejo.scorecard.jobresult;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_results")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long jobId;

    @Column(precision = 5, scale = 2)
    private BigDecimal totalScore;

    @Column(length = 500)
    private String resultS3Key;

    @Column(length = 500)
    private String reportS3Key;

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

    public static JobResult create(Long jobId) {
        JobResult result = new JobResult();
        result.jobId = jobId;
        return result;
    }
}
