"use server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

const DASHBOARD_GAMES = "/dashboard";

// -- GAMES --

export async function createCardGame(data: {
    game_type: 'teams' | 'individual';
    team_a_name: string;
    team_b_name: string;
    player3_name?: string;
    player4_name?: string;
}) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const gameData = {
        creator_id: user.id,
        game_type: data.game_type,
        team_a_name: data.team_a_name,
        team_b_name: data.team_b_name,
        player3_name: data.player3_name,
        player4_name: data.player4_name,
        status: 'active',
    };

    const { data: result, error } = await supabase
        .from("card_games")
        .insert(gameData)
        .select()
        .single();

    if (error) {
        console.error("Error creating game:", error);
        throw new Error(error.message);
    }

    revalidatePath(DASHBOARD_GAMES);
    return result;
}

export async function getCardGames() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("card_games")
        .select(`
            *,
            game_rounds ( team_a_score, team_b_score, p3_score, p4_score ),
            game_penalties ( target_player, points )
        `)
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching games:", error);
        return [];
    }

    // Compute scores
    const gamesWithScores = data.map((game: any) => {
        let team_a_score = 0;
        let team_b_score = 0;
        let p3_score = 0;
        let p4_score = 0;

        if (game.game_rounds) {
            game.game_rounds.forEach((r: any) => {
                team_a_score += r.team_a_score || 0;
                team_b_score += r.team_b_score || 0;
                p3_score += r.p3_score || 0;
                p4_score += r.p4_score || 0;
            });
        }

        if (game.game_penalties) {
            game.game_penalties.forEach((p: any) => {
                if (p.target_player === 'team_a') team_a_score += p.points;
                if (p.target_player === 'team_b') team_b_score += p.points;
                if (p.target_player === 'p3') p3_score += p.points;
                if (p.target_player === 'p4') p4_score += p.points;
            });
        }

        return {
            ...game,
            scores: {
                team_a: team_a_score,
                team_b: team_b_score,
                p3: p3_score,
                p4: p4_score
            }
        };
    });

    return gamesWithScores;
}

export async function getCardGameById(id: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("card_games")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching game:", error);
        return null;
    }
    return data;
}

// -- PENALTIES --

export async function addGamePenalty(gameId: string, target_player: string, points: number, reason: string) {
    const supabase = await createSupabaseServerClient();

    // points should be stored as negative natively by the UI, but we can ensure it here
    const penaltyAmount = points > 0 ? -points : points;

    const penaltyData = {
        game_id: gameId,
        target_player,
        points: penaltyAmount,
        reason
    };

    const { data, error } = await supabase
        .from("game_penalties")
        .insert(penaltyData)
        .select()
        .single();

    if (error) {
        console.error("Error adding penalty:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/dashboard/games/${gameId}`);
    return data;
}

export async function getGamePenalties(gameId: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("game_penalties")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching penalties:", error);
        return [];
    }
    return data;
}

// -- ROUNDS --

export async function createGameRound(
    gameId: string,
    team_a_bid: number,
    team_b_bid: number,
    p3_bid: number | null = null,
    p4_bid: number | null = null
) {
    const supabase = await createSupabaseServerClient();

    // Get current round number
    const { count } = await supabase
        .from("game_rounds")
        .select("*", { count: 'exact', head: true })
        .eq("game_id", gameId);

    const roundNumber = (count || 0) + 1;

    // Check if the round should be instantly completed (Total <= 11, and neither bid >= 10)
    const isHighBid = team_a_bid >= 10 || team_b_bid >= 10 || (p3_bid !== null && p3_bid >= 10) || (p4_bid !== null && p4_bid >= 10);
    const totalBid = team_a_bid + team_b_bid + (p3_bid || 0) + (p4_bid || 0);
    const isInstantComplete = !isHighBid && (totalBid <= 11);

    const roundData = {
        game_id: gameId,
        round_number: roundNumber,
        team_a_bid,
        team_b_bid,
        p3_bid,
        p4_bid,
        is_completed: isInstantComplete,
        team_a_won: isInstantComplete ? 1 : null,
        team_b_won: isInstantComplete ? 1 : null,
        p3_won: isInstantComplete && p3_bid !== null ? 1 : null,
        p4_won: isInstantComplete && p4_bid !== null ? 1 : null,
        team_a_score: isInstantComplete ? team_a_bid : null,
        team_b_score: isInstantComplete ? team_b_bid : null,
        p3_score: isInstantComplete && p3_bid !== null ? p3_bid : null,
        p4_score: isInstantComplete && p4_bid !== null ? p4_bid : null,
    };

    const { data, error } = await supabase
        .from("game_rounds")
        .insert(roundData)
        .select()
        .single();

    if (error) {
        console.error("Error creating round:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/dashboard/games/${gameId}`);
    return data;
}

export async function getGameRounds(gameId: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("game_rounds")
        .select("*")
        .eq("game_id", gameId)
        .order("round_number", { ascending: true });

    if (error) {
        console.error("Error fetching rounds:", error);
        return [];
    }
    return data;
}

export async function scoreGameRound(
    roundId: string,
    gameId: string,
    teamAResult: { success?: boolean, hands?: number },
    teamBResult: { success?: boolean, hands?: number },
    p3Result?: { success?: boolean, hands?: number },
    p4Result?: { success?: boolean, hands?: number }
) {
    const supabase = await createSupabaseServerClient();

    // Fetch the round to get bids
    const { data: round, error: fetchError } = await supabase
        .from("game_rounds")
        .select("*")
        .eq("id", roundId)
        .single();

    if (fetchError || !round) {
        throw new Error("Round not found");
    }

    let team_a_score = 0;
    let team_b_score = 0;
    let p3_score = null;
    let p4_score = null;

    const a_bid = round.team_a_bid;
    const b_bid = round.team_b_bid;
    const p3_bid = round.p3_bid;
    const p4_bid = round.p4_bid;

    const is_a_high_bid = a_bid >= 10;
    const is_b_high_bid = b_bid >= 10;
    const is_p3_high_bid = p3_bid !== null && p3_bid >= 10;
    const is_p4_high_bid = p4_bid !== null && p4_bid >= 10;

    const any_high_bid = is_a_high_bid || is_b_high_bid || is_p3_high_bid || is_p4_high_bid;

    // Team A Scoring
    if (any_high_bid && !is_a_high_bid) {
        team_a_score = teamAResult.hands || 0;
    } else {
        if (teamAResult.success) team_a_score = a_bid;
        else team_a_score = -a_bid;
    }

    // Team B Scoring
    if (any_high_bid && !is_b_high_bid) {
        team_b_score = teamBResult.hands || 0;
    } else {
        if (teamBResult.success) team_b_score = b_bid;
        else team_b_score = -b_bid;
    }

    // P3 Scoring
    if (p3_bid !== null && p3Result) {
        if (any_high_bid && !is_p3_high_bid) {
            p3_score = p3Result.hands || 0;
        } else {
            if (p3Result.success) p3_score = p3_bid;
            else p3_score = -p3_bid;
        }
    }

    // P4 Scoring
    if (p4_bid !== null && p4Result) {
        if (any_high_bid && !is_p4_high_bid) {
            p4_score = p4Result.hands || 0;
        } else {
            if (p4Result.success) p4_score = p4_bid;
            else p4_score = -p4_bid;
        }
    }

    const db_a_won = (any_high_bid && !is_a_high_bid) ? (teamAResult.hands || 0) : (teamAResult.success ? 1 : 0);
    const db_b_won = (any_high_bid && !is_b_high_bid) ? (teamBResult.hands || 0) : (teamBResult.success ? 1 : 0);
    const db_p3_won = p3_bid !== null && p3Result ? ((any_high_bid && !is_p3_high_bid) ? (p3Result.hands || 0) : (p3Result.success ? 1 : 0)) : null;
    const db_p4_won = p4_bid !== null && p4Result ? ((any_high_bid && !is_p4_high_bid) ? (p4Result.hands || 0) : (p4Result.success ? 1 : 0)) : null;

    const { data, error } = await supabase
        .from("game_rounds")
        .update({
            team_a_won: db_a_won,
            team_b_won: db_b_won,
            p3_won: db_p3_won,
            p4_won: db_p4_won,
            team_a_score,
            team_b_score,
            p3_score,
            p4_score,
            is_completed: true
        })
        .eq("id", roundId)
        .select()
        .single();

    if (error) {
        console.error("Error scoring round:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/dashboard/games/${gameId}`);
    return data;
}
