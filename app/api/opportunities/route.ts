import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * API route: GET /api/opportunities
 * Fetches opportunities with optional filtering and sorting
 * 
 * Query params:
 * - status: 'new' | 'pursuing' | 'passed' | 'watching'
 * - source: data source filter
 * - minScore: minimum score (0-100)
 * - maxScore: maximum score (0-100)
 * - sortBy: 'score' | 'date' | 'source'
 * - limit: number of results (default: 100)
 * - offset: pagination offset (default: 0)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const minScore = parseFloat(searchParams.get('minScore') || '0')
    const maxScore = parseFloat(searchParams.get('maxScore') || '100')
    const sortBy = searchParams.get('sortBy') || 'score'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('opportunities')
      .select('*')
      .gte('final_score', minScore)
      .lte('final_score', maxScore)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (source) {
      query = query.eq('source', source)
    }

    // Apply sorting
    switch (sortBy) {
      case 'score':
        query = query.order('final_score', { ascending: false })
        break
      case 'date':
        query = query.order('created_at', { ascending: false })
        break
      case 'source':
        query = query.order('source', { ascending: true })
        break
      default:
        query = query.order('final_score', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /opportunities] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      opportunities: data || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('[GET /opportunities] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * API route: PATCH /api/opportunities/:id
 * Updates an opportunity (status, score override, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const updates = await request.json()

    const { data, error } = await supabase
      .from('opportunities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('[PATCH /opportunities] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      opportunity: data?.[0],
    })
  } catch (error) {
    console.error('[PATCH /opportunities] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
