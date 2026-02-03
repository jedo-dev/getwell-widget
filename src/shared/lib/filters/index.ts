import { Department, Employee } from '../../../types';
import { formatEmployeeFullName } from '../employee-formatting';
;

export function filterEmployeesByQuery(employees: Employee[], query: string): Employee[] {
  const q = query.trim().toLowerCase();
  if (!q) return employees;
  return employees.filter((emp) => {
    const fullName = formatEmployeeFullName(emp).toLowerCase();
    const specialization = (emp.specialization || '').toLowerCase();
    return fullName.includes(q) || specialization.includes(q);
  });
}

export function filterDepartmentsByQuery(departments: Department[], query: string): Department[] {
  const q = query.trim().toLowerCase();
  if (!q) return departments;
  return departments.filter((dept) => dept.name.toLowerCase().includes(q));
}
