package com.taskflow.controller;

import com.taskflow.domain.Project;
import com.taskflow.domain.Task;
import com.taskflow.domain.User;
import com.taskflow.dto.ProjectDto;
import com.taskflow.dto.ProjectRequest;
import com.taskflow.dto.TaskDto;
import com.taskflow.dto.TaskRequest;
import com.taskflow.dto.UserDto;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import com.taskflow.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public ProjectController(ProjectRepository projectRepository, UserRepository userRepository,
            TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, List<ProjectDto>>> listProjects(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Project> projects = projectRepository.findAccessibleProjects(userDetails.getId());
        List<ProjectDto> projectDtos = projects.stream().map(p -> {
            ProjectDto dto = new ProjectDto(p);
            dto.setTasks(null); // the spec output says "projects" : [{ id, name, ... }]
            return dto;
        }).collect(Collectors.toList());

        Map<String, List<ProjectDto>> response = new HashMap<>();
        response.put("projects", projectDtos);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User owner = userRepository.findById(userDetails.getId()).orElseThrow();
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOwner(owner);

        Project savedProject = projectRepository.save(project);
        ProjectDto dto = new ProjectDto(savedProject);
        dto.setTasks(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

        boolean isOwner = project.getOwnerId().equals(userDetails.getId());
        boolean hasTask = project.getTasks().stream()
                .anyMatch(t -> t.getAssigneeId() != null && t.getAssigneeId().equals(userDetails.getId()));

        if (!isOwner && !hasTask) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }

        return ResponseEntity.ok(new ProjectDto(project));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable UUID id,
            @RequestBody ProjectRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

        if (!project.getOwnerId().equals(userDetails.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }

        if (request.getName() != null)
            project.setName(request.getName());
        if (request.getDescription() != null)
            project.setDescription(request.getDescription());

        Project saved = projectRepository.save(project);
        ProjectDto dto = new ProjectDto(saved);
        dto.setTasks(null);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

        if (!project.getOwnerId().equals(userDetails.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }

        projectRepository.delete(project);
        return ResponseEntity.noContent().build();
    }

    // Task sub-resources
    @GetMapping("/{id}/tasks")
    public ResponseEntity<Map<String, List<TaskDto>>> getTasksForProject(
            @PathVariable UUID id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID assignee,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

        boolean isOwner = project.getOwnerId().equals(userDetails.getId());
        boolean hasTask = project.getTasks().stream()
                .anyMatch(t -> t.getAssigneeId() != null && t.getAssigneeId().equals(userDetails.getId()));

        if (!isOwner && !hasTask) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }

        List<Task> tasks = taskRepository.findByProjectIdAndFilters(id, status, assignee);
        List<TaskDto> taskDtos = tasks.stream().map(TaskDto::new).collect(Collectors.toList());

        Map<String, List<TaskDto>> response = new HashMap<>();
        response.put("tasks", taskDtos);
        return ResponseEntity.ok(response);
    }

    // List assignable users (all users in the system)
    @GetMapping("/{id}/members")
    public ResponseEntity<Map<String, List<UserDto>>> getProjectMembers(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

        boolean isOwner = project.getOwnerId().equals(userDetails.getId());
        boolean hasTask = project.getTasks().stream()
                .anyMatch(t -> t.getAssigneeId() != null && t.getAssigneeId().equals(userDetails.getId()));

        if (!isOwner && !hasTask) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }

        // Return all registered users so tasks can be assigned to anyone
        List<UserDto> allUsers = userRepository.findAll().stream()
                .map(u -> new UserDto(u.getId(), u.getName(), u.getEmail()))
                .collect(Collectors.toList());

        Map<String, List<UserDto>> response = new HashMap<>();
        response.put("members", allUsers);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/tasks")
    public ResponseEntity<TaskDto> createTask(
            @PathVariable UUID id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

        boolean isOwner = project.getOwnerId().equals(userDetails.getId());
        boolean hasTask = project.getTasks().stream()
                .anyMatch(t -> t.getAssigneeId() != null && t.getAssigneeId().equals(userDetails.getId()));

        if (!isOwner && !hasTask) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "todo");
        task.setPriority(request.getPriority() != null ? request.getPriority() : "medium");
        task.setDueDate(request.getDue_date());
        task.setProject(project);

        // Set the creator to the current authenticated user
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();
        task.setCreator(currentUser);

        if (request.getAssignee_id() != null) {
            User assignee = userRepository.findById(request.getAssignee_id())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid assignee"));
            task.setAssignee(assignee);
        }

        Task saved = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(new TaskDto(saved));
    }
}
