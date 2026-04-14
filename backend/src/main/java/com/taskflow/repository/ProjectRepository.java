package com.taskflow.repository;

import com.taskflow.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.tasks t WHERE p.owner.id = :userId OR t.assignee.id = :userId")
    List<Project> findAccessibleProjects(@Param("userId") UUID userId);
}
