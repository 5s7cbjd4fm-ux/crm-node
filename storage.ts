import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "./db";
import {
  clientServices,
  clients,
  prospects,
  services,
  type ClientResponse,
  type ClientServiceResponse,
  type CreateClientRequest,
  type CreateClientServiceRequest,
  type CreateProspectRequest,
  type CreateServiceRequest,
  type DashboardSummaryResponse,
  type ProspectResponse,
  type ServiceResponse,
  type UpdateClientRequest,
  type UpdateClientServiceRequest,
  type UpdateProspectRequest,
  type UpdateServiceRequest,
} from "@shared/schema";

export interface IStorage {
  getProspects(params?: {
    q?: string;
    archived?: boolean;
  }): Promise<ProspectResponse[]>;
  getProspect(id: string): Promise<ProspectResponse | undefined>;
  createProspect(input: CreateProspectRequest): Promise<ProspectResponse>;
  updateProspect(
    id: string,
    updates: UpdateProspectRequest,
  ): Promise<ProspectResponse | undefined>;
  deleteProspect(id: string): Promise<boolean>;

  getClients(params?: { q?: string; archived?: boolean }): Promise<ClientResponse[]>;
  getClient(id: string): Promise<ClientResponse | undefined>;
  createClient(input: CreateClientRequest): Promise<ClientResponse>;
  updateClient(
    id: string,
    updates: UpdateClientRequest,
  ): Promise<ClientResponse | undefined>;
  deleteClient(id: string): Promise<boolean>;

  getServices(params?: { active?: boolean }): Promise<ServiceResponse[]>;
  getService(id: string): Promise<ServiceResponse | undefined>;
  createService(input: CreateServiceRequest): Promise<ServiceResponse>;
  updateService(
    id: string,
    updates: UpdateServiceRequest,
  ): Promise<ServiceResponse | undefined>;
  deleteService(id: string): Promise<boolean>;

  getClientServices(params?: {
    clientId?: string;
    serviceId?: string;
    from?: string;
    to?: string;
  }): Promise<ClientServiceResponse[]>;
  getClientService(id: string): Promise<ClientServiceResponse | undefined>;
  createClientService(
    input: CreateClientServiceRequest,
  ): Promise<ClientServiceResponse>;
  updateClientService(
    id: string,
    updates: UpdateClientServiceRequest,
  ): Promise<ClientServiceResponse | undefined>;
  deleteClientService(id: string): Promise<boolean>;

  getDashboardSummary(params: {
    view: "monthly" | "yearly";
    year?: number;
    month?: number;
    serviceId?: string;
    clientId?: string;
  }): Promise<DashboardSummaryResponse>;
}

export class DatabaseStorage implements IStorage {
  async getProspects(params?: {
    q?: string;
    archived?: boolean;
  }): Promise<ProspectResponse[]> {
    const conditions = [];

    if (params?.archived !== undefined) {
      conditions.push(eq(prospects.isArchived, params.archived));
    }

    if (params?.q && params.q.trim().length > 0) {
      const q = `%${params.q.trim()}%`;
      conditions.push(
        sql`(
          ${prospects.firstName} ILIKE ${q} OR
          ${prospects.lastName} ILIKE ${q} OR
          ${prospects.phone} ILIKE ${q} OR
          COALESCE(${prospects.profession}, '') ILIKE ${q} OR
          COALESCE(${prospects.recommendedBy}, '') ILIKE ${q}
        )`,
      );
    }

    return await db
      .select()
      .from(prospects)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(prospects.createdAt));
  }

  async getProspect(id: string): Promise<ProspectResponse | undefined> {
    const [row] = await db
      .select()
      .from(prospects)
      .where(eq(prospects.id, id))
      .limit(1);
    return row;
  }

  async createProspect(input: CreateProspectRequest): Promise<ProspectResponse> {
    const [created] = await db.insert(prospects).values(input).returning();
    return created;
  }

  async updateProspect(
    id: string,
    updates: UpdateProspectRequest,
  ): Promise<ProspectResponse | undefined> {
    const [updated] = await db
      .update(prospects)
      .set(updates)
      .where(eq(prospects.id, id))
      .returning();
    return updated;
  }

  async deleteProspect(id: string): Promise<boolean> {
    const deleted = await db
      .delete(prospects)
      .where(eq(prospects.id, id))
      .returning({ id: prospects.id });
    return deleted.length > 0;
  }

  async getClients(params?: {
    q?: string;
    archived?: boolean;
  }): Promise<ClientResponse[]> {
    const conditions = [];

    if (params?.archived !== undefined) {
      conditions.push(eq(clients.isArchived, params.archived));
    }

    if (params?.q && params.q.trim().length > 0) {
      const q = `%${params.q.trim()}%`;
      conditions.push(
        sql`(
          ${clients.firstName} ILIKE ${q} OR
          ${clients.lastName} ILIKE ${q} OR
          COALESCE(${clients.phone}, '') ILIKE ${q} OR
          COALESCE(${clients.profession}, '') ILIKE ${q} OR
          COALESCE(${clients.recommendedBy}, '') ILIKE ${q}
        )`,
      );
    }

    return await db
      .select()
      .from(clients)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<ClientResponse | undefined> {
    const [row] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);
    return row;
  }

  async createClient(input: CreateClientRequest): Promise<ClientResponse> {
    const [created] = await db.insert(clients).values(input).returning();
    return created;
  }

  async updateClient(
    id: string,
    updates: UpdateClientRequest,
  ): Promise<ClientResponse | undefined> {
    const [updated] = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    const deleted = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning({ id: clients.id });
    return deleted.length > 0;
  }

  async getServices(params?: { active?: boolean }): Promise<ServiceResponse[]> {
    const conditions = [];

    if (params?.active !== undefined) {
      conditions.push(eq(services.isActive, params.active));
    }

    return await db
      .select()
      .from(services)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(services.name);
  }

  async getService(id: string): Promise<ServiceResponse | undefined> {
    const [row] = await db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);
    return row;
  }

  async createService(input: CreateServiceRequest): Promise<ServiceResponse> {
    const [created] = await db.insert(services).values(input).returning();
    return created;
  }

  async updateService(
    id: string,
    updates: UpdateServiceRequest,
  ): Promise<ServiceResponse | undefined> {
    const [updated] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    const deleted = await db
      .delete(services)
      .where(eq(services.id, id))
      .returning({ id: services.id });
    return deleted.length > 0;
  }

  async getClientServices(params?: {
    clientId?: string;
    serviceId?: string;
    from?: string;
    to?: string;
  }): Promise<ClientServiceResponse[]> {
    const conditions = [];

    if (params?.clientId) {
      conditions.push(eq(clientServices.clientId, params.clientId));
    }

    if (params?.serviceId) {
      conditions.push(eq(clientServices.serviceId, params.serviceId));
    }

    if (params?.from) {
      conditions.push(sql`${clientServices.occurredAt} >= ${params.from}`);
    }

    if (params?.to) {
      conditions.push(sql`${clientServices.occurredAt} <= ${params.to}`);
    }

    return await db
      .select()
      .from(clientServices)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(clientServices.occurredAt));
  }

  async getClientService(
    id: string,
  ): Promise<ClientServiceResponse | undefined> {
    const [row] = await db
      .select()
      .from(clientServices)
      .where(eq(clientServices.id, id))
      .limit(1);
    return row;
  }

  async createClientService(
    input: CreateClientServiceRequest,
  ): Promise<ClientServiceResponse> {
    const [created] = await db
      .insert(clientServices)
      .values(input)
      .returning();
    return created;
  }

  async updateClientService(
    id: string,
    updates: UpdateClientServiceRequest,
  ): Promise<ClientServiceResponse | undefined> {
    const [updated] = await db
      .update(clientServices)
      .set(updates)
      .where(eq(clientServices.id, id))
      .returning();
    return updated;
  }

  async deleteClientService(id: string): Promise<boolean> {
    const deleted = await db
      .delete(clientServices)
      .where(eq(clientServices.id, id))
      .returning({ id: clientServices.id });
    return deleted.length > 0;
  }

  async getDashboardSummary(params: {
    view: "monthly" | "yearly";
    year?: number;
    month?: number;
    serviceId?: string;
    clientId?: string;
  }): Promise<DashboardSummaryResponse> {
    const now = new Date();
    const year = params.year ?? now.getFullYear();

    let start: Date;
    let end: Date;

    if (params.view === "yearly") {
      start = new Date(year, 0, 1);
      end = new Date(year + 1, 0, 1);
    } else {
      const month = (params.month ?? now.getMonth() + 1) - 1;
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 1);
    }

    const conditions = [
      sql`${clientServices.occurredAt} >= ${start.toISOString()}`,
      sql`${clientServices.occurredAt} < ${end.toISOString()}`,
    ];

    if (params.serviceId) {
      conditions.push(eq(clientServices.serviceId, params.serviceId));
    }

    if (params.clientId) {
      conditions.push(eq(clientServices.clientId, params.clientId));
    }

    const where = and(...conditions);

    const commissionExpr = sql<number>`
      COALESCE(SUM(
        CASE
          WHEN ${clientServices.commissionAmountCentsOverride} IS NOT NULL
          THEN ${clientServices.commissionAmountCentsOverride} * ${clientServices.splitRatio}::numeric
          ELSE ${clientServices.amountCents} * (${clientServices.commissionRatePercent}::numeric / 100) * ${clientServices.splitRatio}::numeric
        END
      ), 0)::int
    `;

    const [totalRow] = await db
      .select({
        totalCents: sql<number>`COALESCE(SUM(${clientServices.amountCents}), 0)::int`,
        totalCommissionCents: commissionExpr,
      })
      .from(clientServices)
      .where(where);

    const serviceRows = await db
      .select({
        serviceId: services.id,
        serviceName: services.name,
        totalCents: sql<number>`COALESCE(SUM(${clientServices.amountCents}), 0)::int`,
        commissionCents: sql<number>`
          COALESCE(SUM(
            CASE
              WHEN ${clientServices.commissionAmountCentsOverride} IS NOT NULL
              THEN ${clientServices.commissionAmountCentsOverride} * ${clientServices.splitRatio}::numeric
              ELSE ${clientServices.amountCents} * (${clientServices.commissionRatePercent}::numeric / 100) * ${clientServices.splitRatio}::numeric
            END
          ), 0)::int
        `,
      })
      .from(clientServices)
      .leftJoin(services, eq(clientServices.serviceId, services.id))
      .where(where)
      .groupBy(services.id, services.name)
      .orderBy(desc(sql`COALESCE(SUM(${clientServices.amountCents}), 0)`));

    const clientRows = await db
      .select({
        clientId: clients.id,
        firstName: clients.firstName,
        lastName: clients.lastName,
        totalCents: sql<number>`COALESCE(SUM(${clientServices.amountCents}), 0)::int`,
        commissionCents: sql<number>`
          COALESCE(SUM(
            CASE
              WHEN ${clientServices.commissionAmountCentsOverride} IS NOT NULL
              THEN ${clientServices.commissionAmountCentsOverride} * ${clientServices.splitRatio}::numeric
              ELSE ${clientServices.amountCents} * (${clientServices.commissionRatePercent}::numeric / 100) * ${clientServices.splitRatio}::numeric
            END
          ), 0)::int
        `,
      })
      .from(clientServices)
      .leftJoin(clients, eq(clientServices.clientId, clients.id))
      .where(where)
      .groupBy(clients.id, clients.firstName, clients.lastName)
      .orderBy(desc(sql`COALESCE(SUM(${clientServices.amountCents}), 0)`));

    const points: Array<{ period: string; totalCents: number; commissionCents: number }> = [];

    if (params.view === "yearly") {
      const pointsRows = await db
        .select({
          month: sql<number>`EXTRACT(MONTH FROM ${clientServices.occurredAt})`,
          totalCents: sql<number>`COALESCE(SUM(${clientServices.amountCents}), 0)::int`,
          commissionCents: sql<number>`
            COALESCE(SUM(
              CASE
                WHEN ${clientServices.commissionAmountCentsOverride} IS NOT NULL
                THEN ${clientServices.commissionAmountCentsOverride} * ${clientServices.splitRatio}::numeric
                ELSE ${clientServices.amountCents} * (${clientServices.commissionRatePercent}::numeric / 100) * ${clientServices.splitRatio}::numeric
              END
            ), 0)::int
          `,
        })
        .from(clientServices)
        .where(where)
        .groupBy(sql`EXTRACT(MONTH FROM ${clientServices.occurredAt})`)
        .orderBy(sql`EXTRACT(MONTH FROM ${clientServices.occurredAt})`);

      const byMonth = new Map<number, { totalCents: number; commissionCents: number }>();
      for (const r of pointsRows) byMonth.set(r.month, { totalCents: r.totalCents, commissionCents: r.commissionCents });

      for (let m = 1; m <= 12; m++) {
        const label = `${year}-${String(m).padStart(2, "0")}`;
        const data = byMonth.get(m);
        points.push({ period: label, totalCents: data?.totalCents ?? 0, commissionCents: data?.commissionCents ?? 0 });
      }
    } else {
      const pointsRows = await db
        .select({
          day: sql<number>`EXTRACT(DAY FROM ${clientServices.occurredAt})`,
          totalCents: sql<number>`COALESCE(SUM(${clientServices.amountCents}), 0)::int`,
          commissionCents: sql<number>`
            COALESCE(SUM(
              CASE
                WHEN ${clientServices.commissionAmountCentsOverride} IS NOT NULL
                THEN ${clientServices.commissionAmountCentsOverride} * ${clientServices.splitRatio}::numeric
                ELSE ${clientServices.amountCents} * (${clientServices.commissionRatePercent}::numeric / 100) * ${clientServices.splitRatio}::numeric
              END
            ), 0)::int
          `,
        })
        .from(clientServices)
        .where(where)
        .groupBy(sql`EXTRACT(DAY FROM ${clientServices.occurredAt})`)
        .orderBy(sql`EXTRACT(DAY FROM ${clientServices.occurredAt})`);

      const byDay = new Map<number, { totalCents: number; commissionCents: number }>();
      for (const r of pointsRows) byDay.set(r.day, { totalCents: r.totalCents, commissionCents: r.commissionCents });

      const daysInMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      const monthLabel = String(start.getMonth() + 1).padStart(2, "0");
      for (let d = 1; d <= daysInMonth; d++) {
        const label = `${year}-${monthLabel}-${String(d).padStart(2, "0")}`;
        const data = byDay.get(d);
        points.push({ period: label, totalCents: data?.totalCents ?? 0, commissionCents: data?.commissionCents ?? 0 });
      }
    }

    return {
      totalCents: totalRow?.totalCents ?? 0,
      totalCommissionCents: totalRow?.totalCommissionCents ?? 0,
      currency: "EUR",
      breakdownByService: serviceRows
        .filter((r) => r.serviceId)
        .map((r) => ({
          serviceId: r.serviceId as string,
          serviceName: r.serviceName ?? "Service",
          totalCents: r.totalCents,
          commissionCents: r.commissionCents,
        })),
      breakdownByClient: clientRows
        .filter((r) => r.clientId)
        .map((r) => ({
          clientId: r.clientId as string,
          clientName: `${r.firstName} ${r.lastName}`.trim(),
          totalCents: r.totalCents,
          commissionCents: r.commissionCents,
        })),
      points,
    };
  }
}

export const storage = new DatabaseStorage();
