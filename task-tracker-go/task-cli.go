package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"
)

const tasksFile = "tasks.json"

type Status string

const (
	StatusTodo       Status = "todo"
	StatusInProgress Status = "in-progress"
	StatusDone       Status = "done"
)

type Task struct {
	ID          int    `json:"id"`
	Description string `json:"description"`
	Status      Status `json:"status"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

func loadTasks() ([]Task, error) {
	if _, err := os.Stat(tasksFile); os.IsNotExist(err) {
		return []Task{}, nil
	}

	data, err := os.ReadFile(tasksFile)
	if err != nil {
		return nil, fmt.Errorf("problema leyendo tasks.json: %w", err)
	}

	if len(data) == 0 {
		return []Task{}, nil
	}

	var tasks []Task
	if err := json.Unmarshal(data, &tasks); err != nil {
		return nil, fmt.Errorf("error parseando el json: %w", err)
	}

	return tasks, nil
}

func saveTasks(tasks []Task) error {
	data, err := json.MarshalIndent(tasks, "", "  ")
	if err != nil {
		return fmt.Errorf("error con el json: %w", err)
	}

	if err := os.WriteFile(tasksFile, data, 0644); err != nil {
		return fmt.Errorf("no pude guardar tasks.json: %w", err)
	}

	return nil
}

func nextID(tasks []Task) int {
	maxID := 0
	for i := 0; i < len(tasks); i++ {
		if tasks[i].ID > maxID {
			maxID = tasks[i].ID
		}
	}
	return maxID + 1
}

func now() string {
	return time.Now().Format(time.RFC3339)
}

func addTask(description string) error {
	if description == "" {
		return fmt.Errorf("la descripcion esta vacia")
	}

	tasks, err := loadTasks()
	if err != nil {
		return err
	}

	task := Task{
		ID:          nextID(tasks),
		Description: description,
		Status:      StatusTodo,
		CreatedAt:   now(),
		UpdatedAt:   now(),
	}

	tasks = append(tasks, task)

	if err := saveTasks(tasks); err != nil {
		return err
	}

	fmt.Printf("Agregue tarea con ID %d!\n", task.ID)
	return nil
}

func updateTask(idStr, description string) error {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return fmt.Errorf("ID malo: %s", idStr)
	}

	if description == "" {
		return fmt.Errorf("la descripcion esta vacia")
	}

	tasks, err := loadTasks()
	if err != nil {
		return err
	}

	found := false
	for i := range tasks {
		if tasks[i].ID == id {
			tasks[i].Description = description
			tasks[i].UpdatedAt = now()
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("no encontre tarea ID %d", id)
	}

	if err := saveTasks(tasks); err != nil {
		return err
	}

	fmt.Printf("Tarea %d cambiada ok!\n", id)
	return nil
}

func deleteTask(idStr string) error {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return fmt.Errorf("ID malo: %s", idStr)
	}

	tasks, err := loadTasks()
	if err != nil {
		return err
	}

	newTasks := make([]Task, 0, len(tasks))
	found := false
	for _, t := range tasks {
		if t.ID == id {
			found = true
			continue
		}
		newTasks = append(newTasks, t)
	}

	if !found {
		return fmt.Errorf("no encontre tarea ID %d", id)
	}

	if err := saveTasks(newTasks); err != nil {
		return err
	}

	fmt.Printf("Borre tarea %d\n", id)
	return nil
}

func markTask(idStr string, status Status) error {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return fmt.Errorf("ID malo: %s", idStr)
	}

	tasks, err := loadTasks()
	if err != nil {
		return err
	}

	found := false
	for i := range tasks {
		if tasks[i].ID == id {
			tasks[i].Status = status
			tasks[i].UpdatedAt = now()
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("no encontre tarea ID %d", id)
	}

	if err := saveTasks(tasks); err != nil {
		return err
	}

	fmt.Printf("Tarea %d ahora %s\n", id, status)
	return nil
}

func listTasks(filterStatus string) error {
	tasks, err := loadTasks()
	if err != nil {
		return err
	}

	if len(tasks) == 0 {
		fmt.Println("Todavia no hay tareas.")
		return nil
	}

	filtradas := make([]Task, 0)
	for _, t := range tasks {
		if filterStatus == "" || string(t.Status) == filterStatus {
			filtradas = append(filtradas, t)
		}
	}

	if len(filtradas) == 0 {
		fmt.Printf("No tasks en '%s'.\n", filterStatus)
		return nil
	}

	fmt.Printf("%-5s %-12s %s\n", "ID", "Estado", "Descripcion")
	fmt.Println("---------------------")
	for _, t := range filtradas {
		fmt.Printf("%-5d %-12s %s\n", t.ID, t.Status, t.Description)
	}

	return nil
}

func printUsage() {
	fmt.Println(`Uso: task-cli [comando] [args]

Comandos:
  add desc          Agrega tarea
  update id desc    Cambia desc
  delete id         Borra
  mark-in-progress id  En proceso
  mark-done id      Terminada
  list              Todas
  list done/todo/in-progress `)
}

func main() {
	args := os.Args[1:]

	if len(args) == 0 {
		printUsage()
		os.Exit(0)
	}

	comando := args[0]
	var err error

	switch comando {
	case "add":
		if len(args) < 2 {
			fmt.Fprintln(os.Stderr, "Falta desc. Usa: add 'mi tarea'")
			os.Exit(1)
		}
		err = addTask(args[1])

	case "update":
		if len(args) < 3 {
			fmt.Fprintln(os.Stderr, "Faltan id y desc")
			os.Exit(1)
		}
		err = updateTask(args[1], args[2])

	case "delete":
		if len(args) < 2 {
			fmt.Fprintln(os.Stderr, "Falta id")
			os.Exit(1)
		}
		err = deleteTask(args[1])

	case "mark-in-progress":
		if len(args) < 2 {
			fmt.Fprintln(os.Stderr, "Falta id")
			os.Exit(1)
		}
		err = markTask(args[1], StatusInProgress)

	case "mark-done":
		if len(args) < 2 {
			fmt.Fprintln(os.Stderr, "Falta id")
			os.Exit(1)
		}
		err = markTask(args[1], StatusDone)

	case "list":
		filt := ""
		if len(args) >= 2 {
			filt = args[1]
			if filt != "done" && filt != "todo" && filt != "in-progress" {
				fmt.Println("Filtro malo, usa done/todo/in-progress")
				os.Exit(1)
			}
		}
		err = listTasks(filt)

	default:
		fmt.Fprintf(os.Stderr, "No se %s\n", comando)
		printUsage()
		os.Exit(1)
	}

	if err != nil {
		fmt.Fprintf(os.Stderr, "Algo salio mal: %v\n", err)
		os.Exit(1)
	}
}
