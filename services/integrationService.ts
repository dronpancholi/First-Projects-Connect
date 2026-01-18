
import { supabase } from './supabaseClient';
import { Asset, AssetType, AssetMetadata } from '../types';

export const integrationService = {
    /**
     * Links an external resource to a project by creating an Asset record.
     * This respects the "Metadata-First" policy. We store a snapshot of details (metadata)
     * but rely on the external provider for the actual content.
     */
    async linkAsset(
        projectId: string,
        type: AssetType,
        externalId: string,
        name: string,
        url: string,
        metadata: AssetMetadata
    ): Promise<Asset> {
        const payload = {
            project_id: projectId,
            type,
            resource_id: externalId,
            name,
            url,
            metadata, // Stored as JSONB in Postgres
            is_connected: true,
            synced_at: new Date(),
        };

        // Optimistic UI updates or robust error handling would go here
        const { data, error } = await supabase
            .from('assets')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        // Log activity (fire and forget)
        this.logActivity(projectId, 'LINK_ASSET', 'asset', data.id, { entityTitle: name, type });

        return this.mapDatabaseAssetToType(data);
    },

    /**
     * Unlinks an asset. 
     * CRITICAL: This DESTROYS the pointer in our database but NEVER touches the external file.
     * This ensures "Data Ownership" remains with the user/provider.
     */
    async unlinkAsset(assetId: string): Promise<void> {
        const { error } = await supabase
            .from('assets')
            .delete()
            .eq('id', assetId);

        if (error) throw error;
    },

    /**
     * Updates the local metadata snapshot of an asset.
     * This should be called when the user opens the project or manually clicks "Sync".
     */
    async syncAssetMetadata(assetId: string, newMetadata: AssetMetadata): Promise<void> {
        const { error } = await supabase
            .from('assets')
            .update({
                metadata: newMetadata,
                synced_at: new Date(),
                is_connected: true // Re-affirm connection
            })
            .eq('id', assetId);

        if (error) throw error;
    },

    /**
     * Marks an asset as disconnected (e.g., if a 404 or 401 occurs during sync).
     * This surfaces the error to the UI without deleting the record.
     */
    async markAssetAsDisconnected(assetId: string): Promise<void> {
        const { error } = await supabase
            .from('assets')
            .update({ is_connected: false })
            .eq('id', assetId);

        if (error) throw error;
    },

    /**
     * Fetch all assets for a given project.
     */
    async getProjectAssets(projectId: string): Promise<Asset[]> {
        const { data, error } = await supabase
            .from('assets')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map((a: any) => this.mapDatabaseAssetToType(a));
    },

    /**
     * Logs an action to the activity timeline.
     */
    async logActivity(
        projectId: string,
        actionType: string,
        entityType: string,
        entityId: string,
        metadata: any
    ) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // We store the project_id in the metadata for filtering, even if the table doesn't have a column
        const enrichedMetadata = { ...metadata, projectId };

        const { error } = await supabase
            .from('activity_log')
            .insert({
                actor_id: user.id,
                action_type: actionType,
                entity_type: entityType,
                entity_id: entityId,
                metadata: enrichedMetadata, // Check JSONB support in schema
                created_at: new Date()
            });

        if (error) console.warn('Failed to log activity', error);
    },

    mapDatabaseAssetToType(a: any): Asset {
        return {
            id: a.id,
            projectId: a.project_id,
            type: a.type,
            resourceId: a.resource_id,
            name: a.name,
            url: a.url,
            description: a.description,
            metadata: a.metadata,
            isConnected: a.is_connected,
            syncedAt: a.synced_at ? new Date(a.synced_at) : undefined,
            createdAt: new Date(a.created_at),
        };
    }
};
