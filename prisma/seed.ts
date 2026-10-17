import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import { DEMO_PASSWORD } from "../src/lib/demo";
import { buildSampleEvents } from "../src/lib/sample-events";

const prisma = new PrismaClient();

async function main() {
  await prisma.event.deleteMany();
  await prisma.project.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash(DEMO_PASSWORD, 8);

  const mira = await prisma.user.create({
    data: { name: "Mira Chen", email: "mira@signalboard.dev", passwordHash },
  });
  const owen = await prisma.user.create({
    data: { name: "Owen Shah", email: "owen@signalboard.dev", passwordHash },
  });
  const priya = await prisma.user.create({
    data: { name: "Priya Nair", email: "priya@signalboard.dev", passwordHash },
  });

  const northline = await prisma.organization.create({
    data: {
      name: "Northline",
      slug: "northline",
      memberships: {
        create: [
          { userId: mira.id, role: "owner" },
          { userId: owen.id, role: "admin" },
          { userId: priya.id, role: "viewer" },
        ],
      },
    },
  });

  const harbor = await prisma.organization.create({
    data: {
      name: "Harbor",
      slug: "harbor",
      memberships: {
        create: [
          { userId: priya.id, role: "owner" },
          { userId: mira.id, role: "admin" },
        ],
      },
    },
  });

  const checkout = await prisma.project.create({
    data: {
      name: "Checkout",
      slug: "checkout",
      description: "Payment confirmation events for the Northline storefront.",
      seeded: true,
      organizationId: northline.id,
    },
  });
  const docs = await prisma.project.create({
    data: {
      name: "Docs portal",
      slug: "docs-portal",
      description: "Search and page reads on the public docs.",
      seeded: true,
      organizationId: northline.id,
    },
  });
  const status = await prisma.project.create({
    data: {
      name: "Status page",
      slug: "status-page",
      description: "Uptime notices published for Harbor.",
      seeded: true,
      organizationId: harbor.id,
    },
  });

  const projects = { checkout, docs, status };
  const drafts = buildSampleEvents(new Date());
  await prisma.event.createMany({
    data: drafts.map((draft) => ({
      name: draft.name,
      projectId: projects[draft.projectKey].id,
      occurredAt: draft.occurredAt,
      count: draft.count,
      source: draft.source,
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
