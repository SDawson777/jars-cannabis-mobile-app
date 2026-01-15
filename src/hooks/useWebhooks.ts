// src/hooks/useWebhooks.ts
// Webhook & integration platform - events, connectors, CRM integration
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost, clientDelete } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  successRate: number;
}

export type WebhookEventType =
  | 'order.created'
  | 'order.updated'
  | 'order.completed'
  | 'order.cancelled'
  | 'product.recall'
  | 'product.back_in_stock'
  | 'product.price_change'
  | 'loyalty.points_earned'
  | 'loyalty.tier_changed'
  | 'loyalty.reward_redeemed'
  | 'user.registered'
  | 'user.preferences_updated'
  | 'personalization.rule_toggled'
  | 'deal.published'
  | 'deal.expired'
  | 'compliance.alert'
  | 'inventory.low_stock'
  | 'delivery.status_changed';

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: WebhookEventType;
  payload: Record<string, unknown>;
  responseStatus?: number;
  responseBody?: string;
  latencyMs: number;
  success: boolean;
  attemptCount: number;
  createdAt: string;
}

export interface IntegrationConnector {
  id: string;
  type: 'crm' | 'marketing' | 'pos' | 'analytics' | 'sms' | 'email';
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  config?: Record<string, unknown>;
  lastSyncAt?: string;
  syncFrequency?: string;
}

export interface CRMContact {
  id: string;
  externalId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
  customFields: Record<string, unknown>;
  source: string;
  createdAt: string;
  lastActivityAt?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  audienceSegmentId?: string;
  scheduledAt?: string;
  metrics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

// ============================================
// Webhook Management Hooks
// ============================================

/**
 * Hook to fetch webhook endpoints
 */
export function useWebhooks() {
  return useQuery<WebhookEndpoint[], Error>({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const res = await clientGet<{ webhooks: WebhookEndpoint[] }>(
        phase4Client,
        '/webhooks'
      );
      return res.webhooks;
    },
  });
}

/**
 * Hook to fetch a specific webhook
 */
export function useWebhook(webhookId: string) {
  return useQuery<WebhookEndpoint, Error>({
    queryKey: ['webhooks', webhookId],
    queryFn: async () => {
      return await clientGet<WebhookEndpoint>(
        phase4Client,
        `/webhooks/${webhookId}`
      );
    },
    enabled: !!webhookId,
  });
}

/**
 * Hook to create a webhook endpoint
 */
export function useCreateWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation<WebhookEndpoint, Error, {
    name: string;
    url: string;
    events: WebhookEventType[];
  }>({
    mutationFn: async (webhook: {
      name: string;
      url: string;
      events: WebhookEventType[];
    }) => {
      const result = await clientPost<typeof webhook, WebhookEndpoint>(
        phase4Client,
        '/webhooks',
        webhook
      );
      logEvent('webhook_created', { events: webhook.events });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

/**
 * Hook to update a webhook endpoint
 */
export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation<WebhookEndpoint, Error, {
    webhookId: string;
    updates: Partial<Pick<WebhookEndpoint, 'name' | 'url' | 'events' | 'isActive'>>;
  }>({
    mutationFn: async ({ webhookId, updates }: {
      webhookId: string;
      updates: Partial<Pick<WebhookEndpoint, 'name' | 'url' | 'events' | 'isActive'>>;
    }) => {
      const result = await clientPost<typeof updates, WebhookEndpoint>(
        phase4Client,
        `/webhooks/${webhookId}`,
        updates
      );
      return result;
    },
    onSuccess: (_: WebhookEndpoint, variables: { webhookId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', variables.webhookId] });
    },
  });
}

/**
 * Hook to delete a webhook endpoint
 */
export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (webhookId: string) => {
      await clientDelete(phase4Client, `/webhooks/${webhookId}`);
      logEvent('webhook_deleted', { webhookId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

/**
 * Hook to test a webhook endpoint
 */
export function useTestWebhook() {
  return useMutation<{ success: boolean; responseStatus?: number; latencyMs: number }, Error, string>({
    mutationFn: async (webhookId: string) => {
      const result = await clientPost<Record<string, never>, { success: boolean; responseStatus?: number; latencyMs: number }>(
        phase4Client,
        `/webhooks/${webhookId}/test`,
        {}
      );
      return result;
    },
  });
}

/**
 * Hook to fetch webhook delivery history
 */
export function useWebhookDeliveries(webhookId: string, options?: { limit?: number; success?: boolean }) {
  return useQuery<WebhookDelivery[], Error>({
    queryKey: ['webhooks', webhookId, 'deliveries', options],
    queryFn: async () => {
      const res = await clientGet<{ deliveries: WebhookDelivery[] }>(
        phase4Client,
        `/webhooks/${webhookId}/deliveries`,
        { params: options }
      );
      return res.deliveries;
    },
    enabled: !!webhookId,
  });
}

/**
 * Hook to retry a failed webhook delivery
 */
export function useRetryWebhookDelivery() {
  const queryClient = useQueryClient();
  
  return useMutation<WebhookDelivery, Error, { webhookId: string; deliveryId: string }>({
    mutationFn: async ({ webhookId, deliveryId }: { webhookId: string; deliveryId: string }) => {
      const result = await clientPost<Record<string, never>, WebhookDelivery>(
        phase4Client,
        `/webhooks/${webhookId}/deliveries/${deliveryId}/retry`,
        {}
      );
      return result;
    },
    onSuccess: (_: WebhookDelivery, variables: { webhookId: string; deliveryId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', variables.webhookId, 'deliveries'] });
    },
  });
}

// ============================================
// Integration Connector Hooks
// ============================================

/**
 * Hook to fetch integration connectors
 */
export function useIntegrations() {
  return useQuery<IntegrationConnector[], Error>({
    queryKey: ['integrations'],
    queryFn: async () => {
      const res = await clientGet<{ connectors: IntegrationConnector[] }>(
        phase4Client,
        '/integrations'
      );
      return res.connectors;
    },
  });
}

/**
 * Hook to connect an integration
 */
export function useConnectIntegration() {
  const queryClient = useQueryClient();
  
  return useMutation<IntegrationConnector, Error, {
    type: IntegrationConnector['type'];
    provider: string;
    config: Record<string, unknown>;
  }>({
    mutationFn: async (params: {
      type: IntegrationConnector['type'];
      provider: string;
      config: Record<string, unknown>;
    }) => {
      const result = await clientPost<typeof params, IntegrationConnector>(
        phase4Client,
        '/integrations/connect',
        params
      );
      logEvent('integration_connected', { type: params.type, provider: params.provider });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

/**
 * Hook to disconnect an integration
 */
export function useDisconnectIntegration() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (integrationId: string) => {
      await clientPost<Record<string, never>, void>(
        phase4Client,
        `/integrations/${integrationId}/disconnect`,
        {}
      );
      logEvent('integration_disconnected', { integrationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

/**
 * Hook to sync an integration
 */
export function useSyncIntegration() {
  const queryClient = useQueryClient();
  
  return useMutation<{ syncedCount: number; errors: string[] }, Error, string>({
    mutationFn: async (integrationId: string) => {
      const result = await clientPost<Record<string, never>, { syncedCount: number; errors: string[] }>(
        phase4Client,
        `/integrations/${integrationId}/sync`,
        {}
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

// ============================================
// CRM Hooks
// ============================================

/**
 * Hook to fetch CRM contacts
 */
export function useCRMContacts(options?: { segment?: string; tag?: string; limit?: number }) {
  return useQuery<CRMContact[], Error>({
    queryKey: ['crm', 'contacts', options],
    queryFn: async () => {
      const res = await clientGet<{ contacts: CRMContact[] }>(
        phase4Client,
        '/integrations/crm/contacts',
        { params: options }
      );
      return res.contacts;
    },
  });
}

/**
 * Hook to sync a contact to CRM
 */
export function useSyncContactToCRM() {
  const queryClient = useQueryClient();
  
  return useMutation<CRMContact, Error, {
    userId: string;
    customFields?: Record<string, unknown>;
    tags?: string[];
  }>({
    mutationFn: async (params: {
      userId: string;
      customFields?: Record<string, unknown>;
      tags?: string[];
    }) => {
      const result = await clientPost<typeof params, CRMContact>(
        phase4Client,
        '/integrations/crm/contacts/sync',
        params
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
    },
  });
}

// ============================================
// Marketing Automation Hooks
// ============================================

/**
 * Hook to fetch marketing campaigns
 */
export function useMarketingCampaigns(status?: MarketingCampaign['status']) {
  return useQuery<MarketingCampaign[], Error>({
    queryKey: ['marketing', 'campaigns', status],
    queryFn: async () => {
      const res = await clientGet<{ campaigns: MarketingCampaign[] }>(
        phase4Client,
        '/integrations/marketing/campaigns',
        { params: status ? { status } : undefined }
      );
      return res.campaigns;
    },
  });
}

/**
 * Hook to create a marketing campaign
 */
export function useCreateMarketingCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation<MarketingCampaign, Error, {
    name: string;
    platform: string;
    audienceSegmentId?: string;
    content: { subject?: string; body: string; templateId?: string };
    scheduledAt?: string;
  }>({
    mutationFn: async (campaign: {
      name: string;
      platform: string;
      audienceSegmentId?: string;
      content: { subject?: string; body: string; templateId?: string };
      scheduledAt?: string;
    }) => {
      const result = await clientPost<typeof campaign, MarketingCampaign>(
        phase4Client,
        '/integrations/marketing/campaigns',
        campaign
      );
      logEvent('marketing_campaign_created', { platform: campaign.platform });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing', 'campaigns'] });
    },
  });
}

// ============================================
// Event Types Hook
// ============================================

/**
 * Hook to get available webhook event types
 */
export function useWebhookEventTypes() {
  return useQuery<{ eventType: WebhookEventType; description: string; payloadExample: Record<string, unknown> }[], Error>({
    queryKey: ['webhooks', 'event-types'],
    queryFn: async () => {
      const res = await clientGet<{ eventTypes: { eventType: WebhookEventType; description: string; payloadExample: Record<string, unknown> }[] }>(
        phase4Client,
        '/webhooks/event-types'
      );
      return res.eventTypes;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
