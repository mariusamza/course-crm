// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isAfter, isBefore, isToday } from 'date-fns'
import { ro } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, fmt: string = 'dd MMM yyyy') {
  return format(new Date(date), fmt, { locale: ro })
}

export function formatCurrency(amount: number, currency: string = 'RON') {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getCourseStatus(startDate: Date | string, endDate: Date | string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()

  if (isBefore(now, start)) return 'UPCOMING'
  if (isAfter(now, end)) return 'COMPLETED'
  return 'ONGOING'
}

export function generateId(prefix: string, count: number) {
  return `${prefix}${String(count + 1).padStart(3, '0')}`
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
}

export function getFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const DAYS_RO: Record<string, string> = {
  Monday: 'Luni',
  Tuesday: 'Marți',
  Wednesday: 'Miercuri',
  Thursday: 'Joi',
  Friday: 'Vineri',
  Saturday: 'Sâmbătă',
  Sunday: 'Duminică',
}

export function generateTimeSlots(start = 8, end = 22, interval = 30) {
  const slots: string[] = []
  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += interval) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

export const STATUS_COLORS = {
  // Course status
  UPCOMING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ONGOING: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  // Enrollment status
  INTERESTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  FOLLOWING: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  FINISHED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  // Attendance status
  PRESENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ABSENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  LEAVE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  LATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  // Payment status
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  PARTIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export const STATUS_LABELS_RO: Record<string, string> = {
  UPCOMING: 'Viitor',
  ONGOING: 'În desfășurare',
  COMPLETED: 'Finalizat',
  INTERESTED: 'Interesat',
  FOLLOWING: 'Înscris',
  FINISHED: 'Absolvit',
  PRESENT: 'Prezent',
  ABSENT: 'Absent',
  LEAVE: 'Invoiect',
  LATE: 'Întârziat',
  PENDING: 'În așteptare',
  PARTIAL: 'Parțial',
  PAID: 'Plătit',
  OVERDUE: 'Restanță',
  ADMIN: 'Administrator',
  TEACHER: 'Trainer',
  STUDENT: 'Student',
  CASH: 'Numerar',
  CARD: 'Card',
  TRANSFER: 'Transfer',
  OTHER: 'Altul',
}
