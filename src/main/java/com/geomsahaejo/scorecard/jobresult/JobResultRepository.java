package com.geomsahaejo.scorecard.jobresult;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JobResultRepository extends JpaRepository<JobResult, Long> {

    Optional<JobResult> findByJobId(Long jobId);
}
