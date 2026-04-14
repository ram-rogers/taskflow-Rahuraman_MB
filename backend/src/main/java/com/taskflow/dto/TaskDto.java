package com.taskflow.dto;

import com.taskflow.domain.Task;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class TaskDto {
    private UUID id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private UUID project_id;
    private UUID assignee_id;
    private String assignee_name;
    private UUID creator_id;
    private LocalDate due_date;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public TaskDto(Task task) {
        this.id = task.getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus();
        this.priority = task.getPriority();
        this.project_id = task.getProjectId();
        this.assignee_id = task.getAssigneeId();
        this.assignee_name = task.getAssignee() != null ? task.getAssignee().getName() : null;
        this.creator_id = task.getCreatorId();
        this.due_date = task.getDueDate();
        this.created_at = task.getCreatedAt();
        this.updated_at = task.getUpdatedAt();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public UUID getProject_id() {
        return project_id;
    }

    public void setProject_id(UUID project_id) {
        this.project_id = project_id;
    }

    public UUID getAssignee_id() {
        return assignee_id;
    }

    public void setAssignee_id(UUID assignee_id) {
        this.assignee_id = assignee_id;
    }

    public String getAssignee_name() {
        return assignee_name;
    }

    public void setAssignee_name(String assignee_name) {
        this.assignee_name = assignee_name;
    }

    public UUID getCreator_id() {
        return creator_id;
    }

    public void setCreator_id(UUID creator_id) {
        this.creator_id = creator_id;
    }

    public LocalDate getDue_date() {
        return due_date;
    }

    public void setDue_date(LocalDate due_date) {
        this.due_date = due_date;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }

    public LocalDateTime getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(LocalDateTime updated_at) {
        this.updated_at = updated_at;
    }
}
