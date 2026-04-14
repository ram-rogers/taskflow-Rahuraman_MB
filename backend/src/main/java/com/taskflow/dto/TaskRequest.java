package com.taskflow.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.UUID;

public class TaskRequest {
    @NotBlank(message = "is required")
    private String title;
    private String description;
    private String status;
    private String priority;
    private UUID assignee_id;
    private LocalDate due_date;

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

    public UUID getAssignee_id() {
        return assignee_id;
    }

    public void setAssignee_id(UUID assignee_id) {
        this.assignee_id = assignee_id;
    }

    public LocalDate getDue_date() {
        return due_date;
    }

    public void setDue_date(LocalDate due_date) {
        this.due_date = due_date;
    }
}
