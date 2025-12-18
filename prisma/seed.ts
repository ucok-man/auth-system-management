import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import {
  PermissionType,
  PrismaClient,
  Role,
} from '../src/generated/prisma/client';

dotenv.config({
  path: ['.env'],
});

const adapter = new PrismaPg({
  connectionString: process.env.POSTGRES_URL,
});

const prisma = new PrismaClient({
  adapter,
  transactionOptions: {
    timeout: 3 * 60 * 1000,
  },
});

async function SEED_ROLE(): Promise<Role[]> {
  const datas = [
    {
      code: 'admin',
      name: 'Super Administrator',
      description:
        'Has full access to manage users, roles, permissions, and all operational data.',
    },
    {
      code: 'manager',
      name: 'Manager',
      description:
        'Responsible for monitoring activities and approving business processes.',
    },
    {
      code: 'staff',
      name: 'Staff',
      description:
        'Internal user with limited access to perform day-to-day operational tasks.',
    },
    {
      code: 'auditor',
      name: 'Auditor',
      description:
        'Read-only access for auditing, reporting, and compliance purposes.',
    },
  ];

  const roles: Role[] = [];
  for (const data of datas) {
    const role = await prisma.role.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
      },
    });

    roles.push(role);
  }
  return roles;
}

async function SEED_PERMISSION(roles: Role[]) {
  const routes = ['user', 'menu', 'role', 'permission'];
  const actions = ['read', 'create', 'update', 'delete'];

  /**
   * Route-based permissions
   * format: <route>:<action>
   * example: user:read
   */
  const routePermissions = routes.flatMap((route) =>
    actions.map((action) => ({
      code: `${route}:${action}`,
      name: `${action.toUpperCase()} ${route.toUpperCase()}`,
      description: `Allow ${action} operation on ${route} route`,
      type: PermissionType.Route,
    })),
  );
  for (const permission of routePermissions) {
    if (permission.code.endsWith('read')) {
      await prisma.permission.create({
        data: {
          code: permission.code,
          name: permission.name,
          description: permission.description,
          type: permission.type,
          roles: {
            connect: roles.map((r) => ({ code: r.code })),
          },
        },
      });
    } else {
      const admin = roles.find((r) => r.code === 'admin');
      if (!admin) throw new Error('Role admin are not found');
      await prisma.permission.create({
        data: {
          code: permission.code,
          name: permission.name,
          description: permission.description,
          type: permission.type,
          roles: {
            connect: [{ code: admin.code }],
          },
        },
      });
    }
  }

  /**
   * Resource-based permissions
   * format: <role_code>:<action>
   * example: ADMIN:create
   */
  const resourcePermissions = roles.flatMap((role) =>
    actions.map((action) => ({
      code: `${role.code}:${action}`,
      name: `${action.toUpperCase()} ${role.code}`,
      description: `Allow ${role.code} to ${action} its own resources`,
      type: PermissionType.Resource,
    })),
  );
  for (const permission of resourcePermissions) {
    const roleCode = permission.code.split(':')[0];
    const role = roles.find((r) => r.code === roleCode);
    if (!role) throw new Error('role is not found on permission');
    await prisma.permission.create({
      data: {
        code: permission.code,
        name: permission.name,
        description: permission.description,
        type: permission.type,
        roles: {
          connect: [{ code: role.code }],
        },
      },
    });
  }
}

async function SEED_USER(roles: Role[]) {
  const admin = roles.find((r) => r.code === 'admin');
  const manager = roles.find((r) => r.code === 'manager');
  const staff = roles.find((r) => r.code === 'staff');
  const auditor = roles.find((r) => r.code === 'auditor');

  if (!admin || !manager || !staff || !auditor) {
    throw new Error('Required roles not found');
  }

  const users = [
    {
      name: 'admin',
      email: 'admin@example.com',
      password: '$2a$12$h1vn9D.28.XfqT500niKqeWBgm9NneNelf0uK7NkPAutfHoVOb2iu', // @Password123
      roles: [admin],
    },
    {
      name: 'manager',
      email: 'manager1@example.com',
      password: '$2a$12$h1vn9D.28.XfqT500niKqeWBgm9NneNelf0uK7NkPAutfHoVOb2iu', // @Password123
      roles: [manager],
    },
    {
      name: 'staff',
      email: 'staff1@example.com',
      password: '$2a$12$h1vn9D.28.XfqT500niKqeWBgm9NneNelf0uK7NkPAutfHoVOb2iu', // @Password123
      roles: [staff],
    },
    {
      name: 'multirole',
      email: 'multirole@example.com',
      password: '$2a$12$h1vn9D.28.XfqT500niKqeWBgm9NneNelf0uK7NkPAutfHoVOb2iu', // @Password123
      roles: [manager, staff],
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        roles: {
          connect: user.roles.map((r) => ({ code: r.code })),
        },
      },
    });
  }
}

async function SEED_MENU() {
  const DEFAULT_MENU_PERMISSIONS = [
    'admin:read',
    'admin:create',
    'admin:update',
    'admin:delete',
  ];
  const managerRead = 'manager:read';
  const staffRead = 'staff:read';
  const auditorRead = 'auditor:read';

  /* ---------------------------- menu 1 ---------------------------- */
  const menu1Permission = [...DEFAULT_MENU_PERMISSIONS, managerRead];

  const menu1 = await prisma.menu.create({
    data: {
      slug: 'menu-1',
      name: 'Menu 1',
      icon: 'menu',
      resourcePermissions: menu1Permission,
    },
  });

  const menu11 = await prisma.menu.create({
    data: {
      slug: 'menu-1-1',
      name: 'Menu 1.1',
      parentId: menu1.id,
      resourcePermissions: menu1Permission,
    },
  });

  const menu12 = await prisma.menu.create({
    data: {
      slug: 'menu-1-2',
      name: 'Menu 1.2',
      parentId: menu1.id,
      resourcePermissions: menu1Permission,
    },
  });

  await prisma.menu.createMany({
    data: [
      {
        slug: 'menu-1-2-1',
        name: 'Menu 1.2.1',
        parentId: menu12.id,
        resourcePermissions: menu1Permission,
      },
      {
        slug: 'menu-1-2-2',
        name: 'Menu 1.2.2',
        parentId: menu12.id,
        resourcePermissions: menu1Permission,
      },
    ],
  });

  const menu13 = await prisma.menu.create({
    data: {
      slug: 'menu-1-3',
      name: 'Menu 1.3',
      parentId: menu1.id,
      resourcePermissions: menu1Permission,
    },
  });

  await prisma.menu.create({
    data: {
      slug: 'menu-1-3-1',
      name: 'Menu 1.3.1',
      parentId: menu13.id,
      resourcePermissions: menu1Permission,
    },
  });

  /* ---------------------------- Menu 2 ---------------------------- */
  const menu2Permission = [...DEFAULT_MENU_PERMISSIONS, staffRead];

  const menu2 = await prisma.menu.create({
    data: {
      slug: 'menu-2',
      name: 'Menu 2',
      icon: 'menu',
      resourcePermissions: menu2Permission,
    },
  });

  await prisma.menu.create({
    data: {
      slug: 'menu-2-1',
      name: 'Menu 2.1',
      parentId: menu2.id,
      resourcePermissions: menu2Permission,
    },
  });

  const menu22 = await prisma.menu.create({
    data: {
      slug: 'menu-2-2',
      name: 'Menu 2.2',
      parentId: menu2.id,
      resourcePermissions: menu2Permission,
    },
  });

  const menu221 = await prisma.menu.create({
    data: {
      slug: 'menu-2-2-1',
      name: 'Menu 2.2.1',
      parentId: menu22.id,
      resourcePermissions: menu2Permission,
    },
  });

  const menu222 = await prisma.menu.create({
    data: {
      slug: 'menu-2-2-2',
      name: 'Menu 2.2.2',
      parentId: menu22.id,
      resourcePermissions: menu2Permission,
    },
  });

  await prisma.menu.createMany({
    data: [
      {
        slug: 'menu-2-2-2-1',
        name: 'Menu 2.2.2.1',
        parentId: menu222.id,
        resourcePermissions: menu2Permission,
      },
      {
        slug: 'menu-2-2-2-2',
        name: 'Menu 2.2.2.2',
        parentId: menu222.id,
        resourcePermissions: menu2Permission,
      },
      {
        slug: 'menu-2-2-3',
        name: 'Menu 2.2.3',
        parentId: menu22.id,
        resourcePermissions: menu2Permission,
      },
    ],
  });

  await prisma.menu.create({
    data: {
      slug: 'menu-2-3',
      name: 'Menu 2.3',
      parentId: menu2.id,
      resourcePermissions: menu2Permission,
    },
  });

  /* ---------------------------- Menu 3 ---------------------------- */
  const menu3Permission = [...DEFAULT_MENU_PERMISSIONS, auditorRead];
  const menu3 = await prisma.menu.create({
    data: {
      slug: 'menu-3',
      name: 'Menu 3',
      icon: 'menu',
      resourcePermissions: menu3Permission,
    },
  });

  await prisma.menu.createMany({
    data: [
      {
        slug: 'menu-3-1',
        name: 'Menu 3.1',
        parentId: menu3.id,
        resourcePermissions: menu3Permission,
      },
      {
        slug: 'menu-3-2',
        name: 'Menu 3.2',
        parentId: menu3.id,
        resourcePermissions: menu3Permission,
      },
    ],
  });
}

async function main() {
  const roles = await SEED_ROLE();
  await SEED_PERMISSION(roles);
  await SEED_USER(roles);
  await SEED_MENU();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
