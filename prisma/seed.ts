// prisma/seed.ts
import { PrismaClient, Role, EnrollmentStatus, AttendanceStatus, PaymentStatus, PaymentMethod } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.attendance.deleteMany()
  await prisma.courseSession.deleteMany()
  await prisma.paymentInstallment.deleteMany()
  await prisma.finance.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.studentNote.deleteMany()
  await prisma.studentDocument.deleteMany()
  await prisma.course.deleteMany()
  await prisma.trainer.deleteMany()
  await prisma.student.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const teacherPassword = await bcrypt.hash('teacher123', 10)
  const studentPassword = await bcrypt.hash('student123', 10)

  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@coursecrm.com',
      password: hashedPassword,
      role: Role.ADMIN,
    }
  })

  // Trainer users
  const trainer1User = await prisma.user.create({
    data: {
      username: 'ion.popescu',
      email: 'ion.popescu@coursecrm.com',
      password: teacherPassword,
      role: Role.TEACHER,
    }
  })
  const trainer2User = await prisma.user.create({
    data: {
      username: 'maria.ionescu',
      email: 'maria.ionescu@coursecrm.com',
      password: teacherPassword,
      role: Role.TEACHER,
    }
  })
  const trainer3User = await prisma.user.create({
    data: {
      username: 'andrei.stan',
      email: 'andrei.stan@coursecrm.com',
      password: teacherPassword,
      role: Role.TEACHER,
    }
  })

  // Student users
  const student1User = await prisma.user.create({
    data: {
      username: 'elena.dumitrescu',
      email: 'elena.dumitrescu@email.com',
      password: studentPassword,
      role: Role.STUDENT,
    }
  })
  const student2User = await prisma.user.create({
    data: {
      username: 'mihai.gheorghe',
      email: 'mihai.gheorghe@email.com',
      password: studentPassword,
      role: Role.STUDENT,
    }
  })
  const student3User = await prisma.user.create({
    data: {
      username: 'ana.constantin',
      email: 'ana.constantin@email.com',
      password: studentPassword,
      role: Role.STUDENT,
    }
  })
  const student4User = await prisma.user.create({
    data: {
      username: 'vlad.popa',
      email: 'vlad.popa@email.com',
      password: studentPassword,
      role: Role.STUDENT,
    }
  })

  // Trainers
  const trainer1 = await prisma.trainer.create({
    data: {
      trainerId: 'TRN001',
      firstName: 'Ion',
      lastName: 'Popescu',
      phone: '0721 123 456',
      email: 'ion.popescu@coursecrm.com',
      bio: 'Expert în programare web cu 10 ani experiență',
      userId: trainer1User.id,
    }
  })
  const trainer2 = await prisma.trainer.create({
    data: {
      trainerId: 'TRN002',
      firstName: 'Maria',
      lastName: 'Ionescu',
      phone: '0722 234 567',
      email: 'maria.ionescu@coursecrm.com',
      bio: 'Specialist în design grafic și UX',
      userId: trainer2User.id,
    }
  })
  const trainer3 = await prisma.trainer.create({
    data: {
      trainerId: 'TRN003',
      firstName: 'Andrei',
      lastName: 'Stan',
      phone: '0723 345 678',
      email: 'andrei.stan@coursecrm.com',
      bio: 'Trainer certificat în management de proiecte',
      userId: trainer3User.id,
    }
  })

  // Students
  const student1 = await prisma.student.create({
    data: {
      studentId: 'STU001',
      firstName: 'Elena',
      lastName: 'Dumitrescu',
      cnp: '2980315120456',
      phone: '0741 111 222',
      address: 'Str. Mihai Eminescu nr. 12, București',
      ciSeries: 'RX',
      ciNumber: '123456',
      guardianName: null,
      userId: student1User.id,
    }
  })
  const student2 = await prisma.student.create({
    data: {
      studentId: 'STU002',
      firstName: 'Mihai',
      lastName: 'Gheorghe',
      cnp: '1950520130789',
      phone: '0742 222 333',
      address: 'Bd. Unirii nr. 45, Cluj-Napoca',
      ciSeries: 'CJ',
      ciNumber: '234567',
      guardianName: 'Gheorghe Ioan',
      guardianPhone: '0720 111 222',
      guardianEmail: 'gheorghe.ion@email.com',
      userId: student2User.id,
    }
  })
  const student3 = await prisma.student.create({
    data: {
      studentId: 'STU003',
      firstName: 'Ana',
      lastName: 'Constantin',
      cnp: '2001225150123',
      phone: '0743 333 444',
      address: 'Calea Victoriei nr. 78, Timișoara',
      ciSeries: 'TM',
      ciNumber: '345678',
      userId: student3User.id,
    }
  })
  const student4 = await prisma.student.create({
    data: {
      studentId: 'STU004',
      firstName: 'Vlad',
      lastName: 'Popa',
      cnp: '1920814200567',
      phone: '0744 444 555',
      address: 'Str. Libertății nr. 23, Iași',
      ciSeries: 'IS',
      ciNumber: '456789',
      userId: student4User.id,
    }
  })

  // Courses
  const now = new Date()
  const course1 = await prisma.course.create({
    data: {
      courseId: 'CRS001',
      name: 'Programare Web - Full Stack',
      description: 'Curs complet de programare web, acoperind HTML, CSS, JavaScript, React și Node.js',
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 28),
      status: 'ONGOING',
      timeSlots: [{ day: 'Monday', startTime: '18:00', endTime: '20:00' }, { day: 'Wednesday', startTime: '18:00', endTime: '20:00' }],
      weekDays: ['Monday', 'Wednesday'],
      trainerId: trainer1.id,
    }
  })
  const course2 = await prisma.course.create({
    data: {
      courseId: 'CRS002',
      name: 'Design Grafic & UI/UX',
      description: 'Curs de design grafic și UX design folosind Figma și Adobe Suite',
      startDate: new Date(now.getFullYear(), now.getMonth(), 15),
      endDate: new Date(now.getFullYear(), now.getMonth() + 3, 15),
      status: 'ONGOING',
      timeSlots: [{ day: 'Tuesday', startTime: '17:00', endTime: '19:00' }, { day: 'Thursday', startTime: '17:00', endTime: '19:00' }],
      weekDays: ['Tuesday', 'Thursday'],
      trainerId: trainer2.id,
    }
  })
  const course3 = await prisma.course.create({
    data: {
      courseId: 'CRS003',
      name: 'Management de Proiecte',
      description: 'Certificare PMP și metode Agile/Scrum',
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 4, 30),
      status: 'UPCOMING',
      timeSlots: [{ day: 'Saturday', startTime: '09:00', endTime: '13:00' }],
      weekDays: ['Saturday'],
      trainerId: trainer3.id,
    }
  })
  const course4 = await prisma.course.create({
    data: {
      courseId: 'CRS004',
      name: 'Excel Avansat & Analiză Date',
      description: 'Funcții avansate Excel, pivot tables, VBA și Power BI',
      startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() - 1, 28),
      status: 'COMPLETED',
      timeSlots: [{ day: 'Friday', startTime: '16:00', endTime: '18:00' }],
      weekDays: ['Friday'],
      trainerId: trainer1.id,
    }
  })
  const course5 = await prisma.course.create({
    data: {
      courseId: 'CRS005',
      name: 'Marketing Digital',
      description: 'SEO, SEM, Social Media Marketing și Google Analytics',
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 5, 30),
      status: 'UPCOMING',
      timeSlots: [{ day: 'Wednesday', startTime: '19:00', endTime: '21:00' }],
      weekDays: ['Wednesday'],
      trainerId: null,
    }
  })
  const course6 = await prisma.course.create({
    data: {
      courseId: 'CRS006',
      name: 'Limbă Engleză - Business',
      description: 'Engleză pentru mediul de afaceri, prezentări și negocieri',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 6, 30),
      status: 'ONGOING',
      timeSlots: [{ day: 'Monday', startTime: '08:00', endTime: '10:00' }, { day: 'Friday', startTime: '08:00', endTime: '10:00' }],
      weekDays: ['Monday', 'Friday'],
      trainerId: trainer2.id,
    }
  })

  // Enrollments
  await prisma.enrollment.createMany({
    data: [
      { studentId: student1.id, courseId: course1.id, status: EnrollmentStatus.FOLLOWING, enrollmentDate: new Date(now.getFullYear(), now.getMonth() - 1, 5) },
      { studentId: student1.id, courseId: course2.id, status: EnrollmentStatus.INTERESTED, enrollmentDate: new Date(now.getFullYear(), now.getMonth(), 16) },
      { studentId: student2.id, courseId: course1.id, status: EnrollmentStatus.FOLLOWING, enrollmentDate: new Date(now.getFullYear(), now.getMonth() - 1, 3) },
      { studentId: student2.id, courseId: course4.id, status: EnrollmentStatus.FINISHED, enrollmentDate: new Date(now.getFullYear(), now.getMonth() - 3, 5), completionDate: new Date(now.getFullYear(), now.getMonth() - 1, 28) },
      { studentId: student3.id, courseId: course2.id, status: EnrollmentStatus.FOLLOWING, enrollmentDate: new Date(now.getFullYear(), now.getMonth(), 16) },
      { studentId: student3.id, courseId: course6.id, status: EnrollmentStatus.FOLLOWING, enrollmentDate: new Date(now.getFullYear(), now.getMonth(), 2) },
      { studentId: student4.id, courseId: course4.id, status: EnrollmentStatus.FINISHED, enrollmentDate: new Date(now.getFullYear(), now.getMonth() - 3, 5), completionDate: new Date(now.getFullYear(), now.getMonth() - 1, 28) },
      { studentId: student4.id, courseId: course3.id, status: EnrollmentStatus.INTERESTED, enrollmentDate: new Date() },
    ]
  })

  // Course Sessions for course1
  const session1 = await prisma.courseSession.create({
    data: {
      courseId: course1.id,
      sessionDate: new Date(now.getFullYear(), now.getMonth() - 1, 6),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'Introducere în HTML și CSS',
      notes: 'Prima sesiune - setup mediu de lucru',
    }
  })
  const session2 = await prisma.courseSession.create({
    data: {
      courseId: course1.id,
      sessionDate: new Date(now.getFullYear(), now.getMonth() - 1, 8),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'CSS Flexbox și Grid',
      notes: 'Exerciții practice de layout',
    }
  })
  const session3 = await prisma.courseSession.create({
    data: {
      courseId: course1.id,
      sessionDate: new Date(now.getFullYear(), now.getMonth() - 1, 13),
      startTime: '18:00',
      endTime: '20:00',
      topic: 'JavaScript Fundamentals',
    }
  })

  // Attendance
  await prisma.attendance.createMany({
    data: [
      { sessionId: session1.id, studentId: student1.id, status: AttendanceStatus.PRESENT, markedById: adminUser.id },
      { sessionId: session1.id, studentId: student2.id, status: AttendanceStatus.PRESENT, markedById: adminUser.id },
      { sessionId: session2.id, studentId: student1.id, status: AttendanceStatus.PRESENT, markedById: adminUser.id },
      { sessionId: session2.id, studentId: student2.id, status: AttendanceStatus.ABSENT, notes: 'Motivat - medical', markedById: adminUser.id },
      { sessionId: session3.id, studentId: student1.id, status: AttendanceStatus.LATE, notes: '15 minute întârziere', markedById: adminUser.id },
      { sessionId: session3.id, studentId: student2.id, status: AttendanceStatus.PRESENT, markedById: adminUser.id },
    ]
  })

  // Finance records
  const finance1 = await prisma.finance.create({
    data: {
      studentId: student1.id,
      courseId: course1.id,
      totalAmount: 2400,
      paidAmount: 1200,
      advanceAmount: 400,
      status: PaymentStatus.PARTIAL,
      notes: 'Plată în rate lunare',
    }
  })
  await prisma.paymentInstallment.createMany({
    data: [
      { financeId: finance1.id, amount: 800, dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 5), paidDate: new Date(now.getFullYear(), now.getMonth() - 1, 4), method: PaymentMethod.CASH, status: PaymentStatus.PAID },
      { financeId: finance1.id, amount: 800, dueDate: new Date(now.getFullYear(), now.getMonth(), 5), paidDate: new Date(now.getFullYear(), now.getMonth(), 3), method: PaymentMethod.TRANSFER, status: PaymentStatus.PAID },
      { financeId: finance1.id, amount: 800, dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5), method: PaymentMethod.CASH, status: PaymentStatus.PENDING },
    ]
  })

  const finance2 = await prisma.finance.create({
    data: {
      studentId: student2.id,
      courseId: course1.id,
      totalAmount: 2400,
      paidAmount: 2400,
      advanceAmount: 0,
      status: PaymentStatus.PAID,
    }
  })
  await prisma.paymentInstallment.create({
    data: { financeId: finance2.id, amount: 2400, dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 5), paidDate: new Date(now.getFullYear(), now.getMonth() - 1, 5), method: PaymentMethod.CARD, status: PaymentStatus.PAID }
  })

  // Student notes
  await prisma.studentNote.createMany({
    data: [
      { studentId: student1.id, content: 'Studentă foarte motivată, progres excelent în primele sesiuni.', authorId: adminUser.id },
      { studentId: student1.id, content: 'A solicitat materiale suplimentare pentru JavaScript.', authorId: trainer1User.id },
      { studentId: student2.id, content: 'A lipsit o sesiune din motive medicale. A recuperat materialele.', authorId: adminUser.id },
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Demo accounts:')
  console.log('  Admin:   admin / admin123')
  console.log('  Teacher: ion.popescu / teacher123')
  console.log('  Student: elena.dumitrescu / student123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
