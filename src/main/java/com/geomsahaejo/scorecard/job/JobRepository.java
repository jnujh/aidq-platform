package com.geomsahaejo.scorecard.job;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 재진단 이력 조회용 (특정 부모를 가진 자식 Job 목록)
    List<Job> findByParentJobIdOrderByCreatedAtDesc(Long parentJobId);
}
