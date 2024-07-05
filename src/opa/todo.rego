package example
import rego.v1

default allow := false

is_view_action := input.method == "GET"
is_view_or_edit_action := input.method in ["POST", "GET", "UPDATE", "DELETE"]

user := input.payload.sub

employee := employeeId if {
    input.path = ["todos", employeeId]
}

employee := employeeId if {
    input.path[0] != "todos"
    employeeId := "none"
}

# array with direct reports in your department if manager
dep_responsibilities contains direct_report if {
    manages := data.managers[user]
    some direct_report in data.departments[manages]
}

# array with team members that report to you from all projects if project manager
pm_responsibilities contains team_member if {
    some projects in data.pm[user]
    some team_member in data.projects[projects]
}

# you can both view and edit your own todos
allow if {
    is_view_or_edit_action
    user == employee
}

# you can view todos for your direct reports
allow if {
    is_view_action
    employee in dep_responsibilities
}

# you can view all todos for team member in the projects you manage
allow if {
    is_view_action
    employee in pm_responsibilities
}

# you can both view and edit todos for team members in context of the projects you manage
allow if {
    is_view_or_edit_action
    input.path = ["projects", projectid, "todos", teamEmployee]
    projects := data.pm[user]
    projectid in projects
    team_responsibilities := data.projects[projectid]
    teamEmployee in team_responsibilities
}

# use as entrypoint if you want some more data with your evaluation
partial := {
    "allowed": allow, 
    "dep-responsibilities": dep_responsibilities,
    "pm-responsibilities": pm_responsibilities
}