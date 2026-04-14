package com.taskflow.dto;

import com.taskflow.domain.Project;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ProjectDto {
    private UUID id;
    private String name;
    private String description;
    private UUID owner_id;
    private String owner_name;
    private LocalDateTime created_at;
    private List<TaskDto> tasks;

    public ProjectDto(Project project) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.owner_id = project.getOwnerId();
        this.owner_name = project.getOwner() != null ? project.getOwner().getName() : null;
        this.created_at = project.getCreatedAt();
        if (project.getTasks() != null) {
            this.tasks = project.getTasks().stream().map(TaskDto::new).collect(Collectors.toList());
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public UUID getOwner_id() { return owner_id; }
    public void setOwner_id(UUID owner_id) { this.owner_id = owner_id; }
    public String getOwner_name() { return owner_name; }
    public void setOwner_name(String owner_name) { this.owner_name = owner_name; }
    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }
    public List<TaskDto> getTasks() { return tasks; }
    public void setTasks(List<TaskDto> tasks) { this.tasks = tasks; }
}
