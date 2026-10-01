const { getDatabase, closeDatabase, initializeSchema } = require('./db');

const departments = [
  {
    name: 'Engineering',
    description: 'Builds and maintains the products, services and internal platforms used across the organization.'
  },
  {
    name: 'Design',
    description: 'Shapes the visual identity and user experience of company products and interfaces.'
  },
  {
    name: 'Human Resources',
    description: 'Supports recruitment, staff welfare, policy development and organizational development.'
  },
  {
    name: 'Finance',
    description: 'Manages budgeting, financial reporting, payroll processing and expenditure control.'
  },
  {
    name: 'Marketing',
    description: 'Drives brand visibility, campaigns, communications and customer engagement.'
  },
  {
    name: 'Operations',
    description: 'Coordinates day-to-day business activities, logistics and service delivery.'
  }
];

const roles = [
  { name: 'Software Developer', description: 'Writes, tests and maintains application code.' },
  { name: 'Senior Developer', description: 'Leads complex implementation work and code reviews.' },
  { name: 'UI/UX Designer', description: 'Designs interfaces, prototypes and design systems.' },
  { name: 'Product Manager', description: 'Defines product direction and coordinates delivery.' },
  { name: 'HR Officer', description: 'Handles staff records, recruitment and employee relations.' },
  { name: 'Accountant', description: 'Prepares financial records and reconciliations.' },
  { name: 'Marketing Specialist', description: 'Runs campaigns and creates brand content.' },
  { name: 'Team Lead', description: 'Supervises a team and coordinates day-to-day work.' },
  { name: 'QA Engineer', description: 'Verifies software quality through manual and automated testing.' }
];

const staff = [
  {
    first_name: 'Amara',
    last_name: 'Okonkwo',
    email: 'amara.okonkwo@brightpath.example',
    phone: '+234 802 411 5521',
    job_title: 'Senior Backend Developer',
    department: 'Engineering',
    role: 'Senior Developer',
    location: 'Lagos, Nigeria',
    bio: 'Amara has spent eight years building reliable backend services and leads the platform reliability workstream. She enjoys simplifying complicated systems and mentoring junior developers.',
    employment_status: 'Active'
  },
  {
    first_name: 'Daniel',
    last_name: 'Whitfield',
    email: 'daniel.whitfield@brightpath.example',
    phone: '+44 7700 900318',
    job_title: 'Frontend Developer',
    department: 'Engineering',
    role: 'Software Developer',
    location: 'Manchester, United Kingdom',
    bio: 'Daniel focuses on accessible interface development and performance. He maintains the shared component library used across internal tools.',
    employment_status: 'Active'
  },
  {
    first_name: 'Priya',
    last_name: 'Raghunathan',
    email: 'priya.raghunathan@brightpath.example',
    phone: '+91 98200 44127',
    job_title: 'QA Engineer',
    department: 'Engineering',
    role: 'QA Engineer',
    location: 'Bengaluru, India',
    bio: 'Priya designs regression suites and has a strong interest in automated end-to-end testing. She works closely with developers to catch defects early.',
    employment_status: 'Active'
  },
  {
    first_name: 'Marcus',
    last_name: 'Delgado',
    email: 'marcus.delgado@brightpath.example',
    phone: '+1 415 220 7789',
    job_title: 'Engineering Team Lead',
    department: 'Engineering',
    role: 'Team Lead',
    location: 'Austin, United States',
    bio: 'Marcus coordinates the engineering team and oversees delivery planning. He previously worked on distributed systems and payments infrastructure.',
    employment_status: 'Active'
  },
  {
    first_name: 'Chidinma',
    last_name: 'Eze',
    email: 'chidinma.eze@brightpath.example',
    phone: '+234 803 990 1164',
    job_title: 'Senior UI/UX Designer',
    department: 'Design',
    role: 'UI/UX Designer',
    location: 'Enugu, Nigeria',
    bio: 'Chidinma leads design for internal products and maintains the company design system. She is passionate about clarity and inclusive design.',
    employment_status: 'Active'
  },
  {
    first_name: 'Tobias',
    last_name: 'Lindqvist',
    email: 'tobias.lindqvist@brightpath.example',
    phone: '+46 70 123 45 67',
    job_title: 'Product Designer',
    department: 'Design',
    role: 'UI/UX Designer',
    location: 'Stockholm, Sweden',
    bio: 'Tobias turns early research into tested prototypes. He works on workflow improvements for the operations group.',
    employment_status: 'On Leave'
  },
  {
    first_name: 'Grace',
    last_name: 'Mbeki',
    email: 'grace.mbeki@brightpath.example',
    phone: '+27 82 555 0134',
    job_title: 'Head of People',
    department: 'Human Resources',
    role: 'HR Officer',
    location: 'Cape Town, South Africa',
    bio: 'Grace manages staff development programmes and organisational policy. She is responsible for a positive employee experience across the company.',
    employment_status: 'Active'
  },
  {
    first_name: 'Hassan',
    last_name: 'Karim',
    email: 'hassan.karim@brightpath.example',
    phone: '+20 100 447 8890',
    job_title: 'HR Officer',
    department: 'Human Resources',
    role: 'HR Officer',
    location: 'Cairo, Egypt',
    bio: 'Hassan handles recruitment coordination and staff records. He supports onboarding for every new joiner.',
    employment_status: 'Active'
  },
  {
    first_name: 'Beatriz',
    last_name: 'Almeida',
    email: 'beatriz.almeida@brightpath.example',
    phone: '+351 912 334 556',
    job_title: 'Finance Manager',
    department: 'Finance',
    role: 'Accountant',
    location: 'Lisbon, Portugal',
    bio: 'Beatriz prepares monthly financial reports and manages the annual budgeting cycle. She is a certified accountant with a focus on cost control.',
    employment_status: 'Active'
  },
  {
    first_name: 'Samuel',
    last_name: 'Adeyemi',
    email: 'samuel.adeyemi@brightpath.example',
    phone: '+234 806 221 7780',
    job_title: 'Accounts Officer',
    department: 'Finance',
    role: 'Accountant',
    location: 'Ibadan, Nigeria',
    bio: 'Samuel processes supplier payments and performs monthly reconciliations. He supports audit preparation each year.',
    employment_status: 'Active'
  },
  {
    first_name: 'Lucia',
    last_name: 'Ferrari',
    email: 'lucia.ferrari@brightpath.example',
    phone: '+39 320 987 6543',
    job_title: 'Brand Marketing Lead',
    department: 'Marketing',
    role: 'Marketing Specialist',
    location: 'Milan, Italy',
    bio: 'Lucia leads brand campaigns and manages the company content calendar. She works with the design team on launch materials.',
    employment_status: 'Active'
  },
  {
    first_name: 'Emeka',
    last_name: 'Nwachukwu',
    email: 'emeka.nwachukwu@brightpath.example',
    phone: '+234 809 776 2214',
    job_title: 'Digital Marketing Specialist',
    department: 'Marketing',
    role: 'Marketing Specialist',
    location: 'Port Harcourt, Nigeria',
    bio: 'Emeka runs email and social campaigns and reports on engagement performance. He enjoys testing new channels for growth.',
    employment_status: 'Active'
  },
  {
    first_name: 'Ingrid',
    last_name: 'Halvorsen',
    email: 'ingrid.halvorsen@brightpath.example',
    phone: '+47 912 34 567',
    job_title: 'Operations Manager',
    department: 'Operations',
    role: 'Team Lead',
    location: 'Oslo, Norway',
    bio: 'Ingrid coordinates daily service delivery and vendor relationships. She introduced the current scheduling system used by the operations team.',
    employment_status: 'Active'
  },
  {
    first_name: 'Rafael',
    last_name: 'Moreno',
    email: 'rafael.moreno@brightpath.example',
    phone: '+52 55 1234 9876',
    job_title: 'Logistics Coordinator',
    department: 'Operations',
    role: 'Team Lead',
    location: 'Mexico City, Mexico',
    bio: 'Rafael plans distribution routes and manages stock levels. He coordinates with suppliers to maintain reliable lead times.',
    employment_status: 'Active'
  },
  {
    first_name: 'Nadia',
    last_name: 'Petrova',
    email: 'nadia.petrova@brightpath.example',
    phone: '+7 912 345 67 89',
    job_title: 'Product Manager',
    department: 'Engineering',
    role: 'Product Manager',
    location: 'Tbilisi, Georgia',
    bio: 'Nadia defines product requirements and gathers stakeholder feedback. She owns the internal tools roadmap.',
    employment_status: 'Active'
  },
  {
    first_name: 'Oliver',
    last_name: 'Bennett',
    email: 'oliver.bennett@brightpath.example',
    phone: '+61 412 887 665',
    job_title: 'Fullstack Developer',
    department: 'Engineering',
    role: 'Software Developer',
    location: 'Melbourne, Australia',
    bio: 'Oliver builds features across the stack and contributes to the internal API services. He enjoys working close to the product team.',
    employment_status: 'On Leave'
  },
  {
    first_name: 'Sofia',
    last_name: 'Alvarez',
    email: 'sofia.alvarez@brightpath.example',
    phone: '+34 611 223 344',
    job_title: 'Content Marketing Specialist',
    department: 'Marketing',
    role: 'Marketing Specialist',
    location: 'Valencia, Spain',
    bio: 'Sofia writes case studies and product announcements. She supports the marketing team with editorial planning.',
    employment_status: 'Inactive'
  },
  {
    first_name: 'Yusuf',
    last_name: 'Bello',
    email: 'yusuf.bello@brightpath.example',
    phone: '+234 705 998 1122',
    job_title: 'Frontend Developer',
    department: 'Engineering',
    role: 'Software Developer',
    location: 'Kano, Nigeria',
    bio: 'Yusuf works on interface improvements and browser compatibility testing. He is currently on a long-term secondment.',
    employment_status: 'Inactive'
  }
];

function seedDepartments(db) {
  const insert = db.prepare(
    'INSERT INTO departments (name, description) VALUES (@name, @description) ON CONFLICT(name) DO NOTHING'
  );
  const run = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(row);
    }
  });
  run(departments);
}

function seedRoles(db) {
  const insert = db.prepare(
    'INSERT INTO roles (name, description) VALUES (@name, @description) ON CONFLICT(name) DO NOTHING'
  );
  const run = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(row);
    }
  });
  run(roles);
}

function seedStaff(db) {
  const insert = db.prepare(`
    INSERT INTO staff (
      first_name, last_name, email, phone, job_title,
      department_id, role_id, location, avatar_url, bio, employment_status
    ) VALUES (
      @first_name, @last_name, @email, @phone, @job_title,
      @department_id, @role_id, @location, @avatar_url, @bio, @employment_status
    )
    ON CONFLICT(email) DO NOTHING
  `);

  const findDepartment = db.prepare('SELECT id FROM departments WHERE name = ?');
  const findRole = db.prepare('SELECT id FROM roles WHERE name = ?');

  const run = db.transaction((rows) => {
    for (const row of rows) {
      const department = findDepartment.get(row.department);
      const role = findRole.get(row.role);

      if (!department || !role) {
        throw new Error(
          'Missing reference for staff member ' + row.email + ': ' + row.department + ' / ' + row.role
        );
      }

      insert.run({
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        job_title: row.job_title,
        department_id: department.id,
        role_id: role.id,
        location: row.location,
        avatar_url: row.avatar_url || '/assets/images/placeholders/avatar.svg',
        bio: row.bio,
        employment_status: row.employment_status
      });
    }
  });

  run(staff);
}

function seedDatabase() {
  const db = getDatabase();

  initializeSchema();

  const run = db.transaction(() => {
    seedDepartments(db);
    seedRoles(db);
    seedStaff(db);
  });
  run();

  const counts = {
    departments: db.prepare('SELECT COUNT(*) AS count FROM departments').get().count,
    roles: db.prepare('SELECT COUNT(*) AS count FROM roles').get().count,
    staff: db.prepare('SELECT COUNT(*) AS count FROM staff').get().count
  };

  closeDatabase();

  return counts;
}

if (require.main === module) {
  const counts = seedDatabase();
  console.log('Seed complete.');
  console.log('  departments: ' + counts.departments);
  console.log('  roles: ' + counts.roles);
  console.log('  staff: ' + counts.staff);
}

module.exports = { seedDatabase };
