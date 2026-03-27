use std::env;
use std::fs;
use std::io;
use std::process;
use std::time::{SystemTime, UNIX_EPOCH};

const TASKS_FILE: &str = "tasks.json";

#[derive(Debug, Clone, PartialEq)]
enum Status {
    Todo,
    InProgress,
    Done,
}

impl Status {
    fn as_str(&self) -> &str {
        match self {
            Status::Todo => "todo",
            Status::InProgress => "in-progress",
            Status::Done => "done",
        }
    }
    fn from_str(s: &str) -> Option<Status> {
        match s {
            "todo" => Some(Status::Todo),
            "in-progress" => Some(Status::InProgress),
            "done" => Some(Status::Done),
            _ => None,
        }
    }
}

#[derive(Debug, Clone)]
struct Task {
    id: u64,
    description: String,
    status: Status,
    created_at: String,
    updated_at: String,
}

fn now_iso() -> String {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    format_iso8601(secs)
}

fn format_iso8601(secs: u64) -> String {
    let s = secs % 60;
    let m = (secs / 60) % 60;
    let h = (secs / 3600) % 24;
    let days = secs / 86400;
    let mut year = 1970u64;
    let mut remaining_days = days;
    loop {
        let days_in_year = if is_leap_year(year) { 366 } else { 365 };
        if remaining_days < days_in_year { break; }
        remaining_days -= days_in_year;
        year += 1;
    }
    let months = [31u64, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let mut month = 1u64;
    for (i, &days_in_month) in months.iter().enumerate() {
        let dim = if i == 1 && is_leap_year(year) { 29 } else { days_in_month };
        if remaining_days < dim { break; }
        remaining_days -= dim;
        month += 1;
    }
    let day = remaining_days + 1;
    format!("{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z", year, month, day, h, m, s)
}

fn is_leap_year(year: u64) -> bool {
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
}

fn escape_json(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '"' => result.push_str("\\\""),
            '\\' => result.push_str("\\\\"),
            '\n' => result.push_str("\\n"),
            '\r' => result.push_str("\\r"),
            '\t' => result.push_str("\\t"),
            _ => result.push(c),
        }
    }
    result
}

fn tasks_to_json(tasks: &[Task]) -> String {
    let mut out = String::from("[\n");
    for (i, t) in tasks.iter().enumerate() {
        out.push_str(&format!(
            "  {{\n    \"id\": {},\n    \"description\": \"{}\",\n    \"status\": \"{}\",\n    \"createdAt\": \"{}\",\n    \"updatedAt\": \"{}\"\n  }}",
            t.id, escape_json(&t.description), t.status.as_str(), t.created_at, t.updated_at
        ));
        if i + 1 < tasks.len() { out.push(','); }
        out.push('\n');
    }
    out.push(']');
    out
}

fn parse_string_value(s: &str) -> String {
    let s = s.trim();
    if s.starts_with('"') && s.ends_with('"') && s.len() >= 2 {
        let inner = &s[1..s.len() - 1];
        inner.replace("\\\"", "\"").replace("\\\\", "\\").replace("\\n", "\n").replace("\\r", "\r").replace("\\t", "\t")
    } else {
        s.to_string()
    }
}

fn load_tasks() -> Result<Vec<Task>, String> {
    let content = match fs::read_to_string(TASKS_FILE) {
        Ok(c) => c,
        Err(e) if e.kind() == io::ErrorKind::NotFound => return Ok(vec![]),
        Err(e) => return Err(format!("Error al leer el archivo: {}", e)),
    };
    let content = content.trim();
    if content.is_empty() || content == "[]" { return Ok(vec![]); }
    let mut tasks = Vec::new();
    let content = content.trim_start_matches('[').trim_end_matches(']');
    let mut depth = 0i32;
    let mut start = 0usize;
    let chars: Vec<char> = content.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        match chars[i] {
            '{' => { if depth == 0 { start = i; } depth += 1; }
            '}' => { depth -= 1; if depth == 0 { let obj: String = chars[start..=i].iter().collect(); if let Some(task) = parse_task_object(&obj) { tasks.push(task); } } }
            _ => {}
        }
        i += 1;
    }
    Ok(tasks)
}

fn parse_task_object(obj: &str) -> Option<Task> {
    let get_field = |key: &str| -> Option<String> {
        let pattern = format!("\"{}\"", key);
        let pos = obj.find(&pattern)?;
        let rest = &obj[pos + pattern.len()..];
        let colon_pos = rest.find(':')?;
        let value_start = &rest[colon_pos + 1..].trim_start();
        if value_start.starts_with('"') {
            let end = value_start[1..].find('"').map(|p| p + 1)?;
            Some(parse_string_value(&value_start[..=end]))
        } else {
            let end = value_start.find(|c: char| c == ',' || c == '}' || c == '\n').unwrap_or(value_start.len());
            Some(value_start[..end].trim().to_string())
        }
    };
    let id: u64 = get_field("id")?.trim().parse().ok()?;
    let description = get_field("description")?;
    let status = Status::from_str(&get_field("status")?)?;
    let created_at = get_field("createdAt").unwrap_or_default();
    let updated_at = get_field("updatedAt").unwrap_or_default();
    Some(Task { id, description, status, created_at, updated_at })
}

fn save_tasks(tasks: &[Task]) -> Result<(), String> {
    fs::write(TASKS_FILE, tasks_to_json(tasks)).map_err(|e| format!("Error al guardar: {}", e))
}

fn next_id(tasks: &[Task]) -> u64 {
    tasks.iter().map(|t| t.id).max().unwrap_or(0) + 1
}

fn cmd_add(description: &str) -> Result<(), String> {
    if description.is_empty() { return Err("La descripción no puede estar vacía.".to_string()); }
    let mut tasks = load_tasks()?;
    let id = next_id(&tasks);
    let timestamp = now_iso();
    tasks.push(Task { id, description: description.to_string(), status: Status::Todo, created_at: timestamp.clone(), updated_at: timestamp });
    save_tasks(&tasks)?;
println!("Tarea ID {} agregada!", id);
    Ok(())
}

fn cmd_update(id_str: &str, description: &str) -> Result<(), String> {
    let id: u64 = id_str.parse().map_err(|_| format!("ID inválido: {}", id_str))?;
    if description.is_empty() { return Err("La descripción no puede estar vacía.".to_string()); }
    let mut tasks = load_tasks()?;
    let task = tasks.iter_mut().find(|t| t.id == id).ok_or_else(|| format!("Tarea con ID {} no encontrada.", id))?;
    task.description = description.to_string();
    task.updated_at = now_iso();
    save_tasks(&tasks)?;
println!("Tarea {} cambiada!", id);
    Ok(())
}

fn cmd_delete(id_str: &str) -> Result<(), String> {
    let id: u64 = id_str.parse().map_err(|_| format!("ID inválido: {}", id_str))?;
    let mut tasks = load_tasks()?;
    let initial_len = tasks.len();
    tasks.retain(|t| t.id != id);
    if tasks.len() == initial_len { return Err(format!("Tarea con ID {} no encontrada.", id)); }
    save_tasks(&tasks)?;
    println!("Tarea {} eliminada exitosamente.", id);
    Ok(())
}

fn cmd_mark(id_str: &str, status: Status) -> Result<(), String> {
    let id: u64 = id_str.parse().map_err(|_| format!("ID inválido: {}", id_str))?;
    let mut tasks = load_tasks()?;
    let task = tasks.iter_mut().find(|t| t.id == id).ok_or_else(|| format!("Tarea con ID {} no encontrada.", id))?;
    let label = status.as_str().to_string();
    task.status = status;
    task.updated_at = now_iso();
    save_tasks(&tasks)?;
    println!("Tarea {} marcada como '{}'.", id, label);
    Ok(())
}

fn cmd_list(filter: Option<&str>) -> Result<(), String> {
    let tasks = load_tasks()?;
    if tasks.is_empty() { println!("No hay tareas registradas."); return Ok(()); }
    let filtered: Vec<&Task> = tasks.iter().filter(|t| filter.map(|f| t.status.as_str() == f).unwrap_or(true)).collect();
    if filtered.is_empty() { println!("No hay tareas con estado '{}'.", filter.unwrap_or("")); return Ok(()); }
    println!("{:<5} {:<12} {}", "ID", "Estado", "Descripción");
    println!("{}", "-".repeat(50));
    for t in filtered { println!("{:<5} {:<12} {}", t.id, t.status.as_str(), t.description); }
    Ok(())
}

fn print_usage() {
    println!("Uso: task-cli <comando> [argumentos]\n\nComandos:\n  add <desc>              Agrega una tarea\n  update <id> <desc>      Actualiza una tarea\n  delete <id>             Elimina una tarea\n  mark-in-progress <id>   Marca como en progreso\n  mark-done <id>          Marca como realizada\n  list                    Lista todas\n  list done/todo/in-progress");
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 { print_usage(); process::exit(0); }
    let result = match args[1].as_str() {
        "add" => { if args.len() < 3 { eprintln!("Error: falta la descripción."); process::exit(1); } cmd_add(&args[2]) }
        "update" => { if args.len() < 4 { eprintln!("Error: faltan ID y descripción."); process::exit(1); } cmd_update(&args[2], &args[3]) }
        "delete" => { if args.len() < 3 { eprintln!("Error: falta el ID."); process::exit(1); } cmd_delete(&args[2]) }
        "mark-in-progress" => { if args.len() < 3 { eprintln!("Error: falta el ID."); process::exit(1); } cmd_mark(&args[2], Status::InProgress) }
        "mark-done" => { if args.len() < 3 { eprintln!("Error: falta el ID."); process::exit(1); } cmd_mark(&args[2], Status::Done) }
        "list" => {
            let filter = if args.len() >= 3 {
                let f = args[2].as_str();
                if f != "done" && f != "todo" && f != "in-progress" { eprintln!("Error: filtro inválido '{}'", f); process::exit(1); }
                Some(f)
            } else { None };
            cmd_list(filter)
        }
        cmd => { eprintln!("Comando desconocido: {}\n", cmd); print_usage(); process::exit(1); }
    };
    if let Err(e) = result { eprintln!("Error: {}", e); process::exit(1); }
}