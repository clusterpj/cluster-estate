import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/database.types'

const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (_req) => {
  try {
    const searchParams = new URL(_req.url).searchParams
    const forceSyncAll = searchParams.get('forceSyncAll') === 'true'

    // Get all enabled calendar feeds that need syncing
    const now = new Date()
    const query = supabase
      .from('calendar_feeds')
      .select('*')
      .eq('sync_enabled', true)

    // Only apply time filter if not forcing sync for all feeds
    if (!forceSyncAll) {
      query.filter('last_sync_at', 'lt', new Date(now.getTime() - 15 * 60000).toISOString())
    }

    const { data: feeds, error: feedsError } = await query

    if (feedsError) {
      throw feedsError
    }

    if (!feeds || feeds.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No feeds need syncing' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Process each feed
    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        try {
          // Determine if we need to sync based on frequency
          if (!forceSyncAll && feed.last_sync_at) {
            const lastSync = new Date(feed.last_sync_at)
            const minutesSinceLastSync = Math.floor((now.getTime() - lastSync.getTime()) / 60000)
            if (minutesSinceLastSync < feed.sync_frequency) {
              return { feed: feed.id, status: 'skipped', reason: 'Not due for sync yet' }
            }
          }

          // Fetch and parse the feed
          const response = await fetch(feed.feed_url)
          if (!response.ok) {
            throw new Error(`Failed to fetch feed: ${response.status}`)
          }
          
          // Make a request to our API endpoint to process the sync
          const syncResponse = await fetch(
            `${Deno.env.get('PUBLIC_SITE_URL')}/api/ical/${feed.property_id}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({ 
                feedId: feed.id,
                force: forceSyncAll
              })
            }
          )

          if (!syncResponse.ok) {
            throw new Error(`Sync failed: ${syncResponse.status}`)
          }

          const result = await syncResponse.json()

          // Update feed status
          await supabase
            .from('calendar_feeds')
            .update({
              last_sync_at: now.toISOString(),
              last_sync_status: 'success',
              last_sync_result: result
            })
            .eq('id', feed.id)

          return { feed: feed.id, status: 'success', result }
        } catch (error) {
          // Update feed with error status
          await supabase
            .from('calendar_feeds')
            .update({
              last_sync_at: now.toISOString(),
              last_sync_status: 'error',
              last_sync_result: {
                error: error.message,
                timestamp: now.toISOString()
              }
            })
            .eq('id', feed.id)

          return { feed: feed.id, status: 'error', error: error.message }
        }
      })
    )

    // Filter and count results
    const processedResults = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        const status = result.value.status
        acc[status] = (acc[status] || 0) + 1
      } else {
        acc.failed = (acc.failed || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return new Response(
      JSON.stringify({ 
        message: 'Calendar sync completed',
        summary: processedResults,
        details: results
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process calendar syncs',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})