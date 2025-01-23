import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { calendarSyncService } from '@/services/calendar-sync'

// Initialize Supabase admin client for background tasks
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function syncCalendars() {
  try {
    console.log('Starting calendar sync job...')

    // Get all active feeds due for sync
    const { data: feeds, error: feedsError } = await supabase
      .from('calendar_sync')
      .select('*')
      .eq('sync_enabled', true)
      .lte('last_sync_at', new Date(Date.now() - 1000 * 60 * 15).toISOString()) // Sync feeds that haven't been updated in the last 15 minutes

    if (feedsError) {
      throw feedsError
    }

    if (!feeds || feeds.length === 0) {
      console.log('No feeds to sync')
      return
    }

    console.log(`Found ${feeds.length} feeds to sync`)

    // Process each feed
    const results = await Promise.allSettled(
      feeds.map(feed => processFeed(feed))
    )

    // Log results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Successfully synced feed ${feeds[index].id}:`, result.value)
      } else {
        console.error(`Failed to sync feed ${feeds[index].id}:`, result.reason)
      }
    })

    console.log('Calendar sync job completed')
  } catch (error) {
    console.error('Calendar sync job failed:', error)
    throw error
  }
}

async function processFeed(feed: Database['public']['Tables']['calendar_sync']['Row']) {
  try {
    console.log(`Processing feed ${feed.id}...`)
    
    const result = await calendarSyncService.processSyncJob(feed.id)
    
    // Update last sync timestamp even if there were no events
    await supabase
      .from('calendar_sync')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', feed.id)

    return result
  } catch (error) {
    console.error(`Error processing feed ${feed.id}:`, error)
    
    // Log the error but don't update last_sync_at to retry on next run
    await supabase
      .from('calendar_sync_logs')
      .insert({
        feed_id: feed.id,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        processed_at: new Date().toISOString()
      })

    throw error
  }
}

// For local development/testing
if (require.main === module) {
  syncCalendars()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error)
      process.exit(1)
    })
}