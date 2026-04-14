package com.taskflow.controller;

import com.taskflow.domain.Task;
import com.taskflow.domain.User;
import com.taskflow.dto.TaskDto;
import com.taskflow.dto.TaskRequest;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import com.taskflow.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private static final Set<String> VALID_STATUSES = Set.of("todo", "in_progress", "done");
    private static final Set<String> VALID_PRIORITIES = Set.of("low", "medium", "high");

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable UUID id,
            @RequestBody TaskRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

        boolean isOwner = task.getProject().getOwnerId().equals(userDetails.getId());
        boolean hasTaskInProject = task.getProject().getTasks().stream()
                .anyMatch(t -> t.getAssigneeId() != null && t.getAssigneeId().equals(userDetails.getId()));

        if (!isOwner && !hasTaskInProject) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }

        if (request.getTitle() != null)
            task.setTitle(request.getTitle());
        if (request.getDescription() != null)
            task.setDescription(request.getDescription());

        if (request.getStatus() != null && !request.getStatus().equals(task.getStatus())) {
            if (!VALID_STATUSES.contains(request.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid status. Must be one of: todo, in_progress, done");
            }
            boolean isAssignee = task.getAssigneeId() != null && task.getAssigneeId().equals(userDetails.getId());
            if (!isOwner && !isAssignee) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Only the assignee or project owner can change the task status");
            }
            task.setStatus(request.getStatus());
        }

        if (request.getPriority() != null) {
            if (!VALID_PRIORITIES.contains(request.getPriority())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid priority. Must be one of: low, medium, high");
            }
            task.setPriority(request.getPriority());
        }
        if (request.getDue_date() != null)
            task.setDueDate(request.getDue_date());

        if (request.getAssignee_id() != null) {
            User assignee = userRepository.findById(request.getAssignee_id())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid assignee"));
            task.setAssignee(assignee);
        }

        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(new TaskDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

        boolean isOwner = task.getProject().getOwnerId().equals(userDetails.getId());
        boolean isCreator = task.getCreatorId() != null && task.getCreatorId().equals(userDetails.getId());

        if (!isOwner && !isCreator) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }

        taskRepository.delete(task);
        return ResponseEntity.noContent().build();
    }
}
