"use server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { IBlog, Icourse, IModule } from "@/lib/types";
import { revalidatePath, unstable_noStore } from "next/cache";
// import { BlogFormSchema, BlogFormSchemaType, Chapterformschematype , CourseFormSchematype } from "../../app/dashboard/blog/schema";
const DASHBOARD = "/dashboard/blog";
// Create a new battle
export async function createBattle(data: {
	title: string;
	participant_a_username: string;
	participant_b_username: string;
	participant_a_image?: string;
	participant_b_image?: string;
	participant_a_followers: string;
	participant_b_followers: string;
	description: string;
	creator: string;
	slug: string;
	status: boolean;
	created_at: string;
	voting_enabled: boolean;
	battle_duration: string;
	category: string;
}) {
	const supabase = await createSupabaseServerClient();
	const battleResult = await supabase
		.from("battles")
		.insert(data)
		.single();
    console.log(battleResult);
	return battleResult;
}

// Get battle by slug
export async function getBattleBySlug(slug: string) {
	const supabase = await createSupabaseServerClient();
	const battleResult = await supabase
		.from("battles")
		.select("*")
		.eq("slug", slug)
		.single();

	return battleResult;
}

// Get battle by ID
export async function getBattleById(id: string) {
	const supabase = await createSupabaseServerClient();
	const battleResult = await supabase
		.from("battles")
		.select("*")
		.eq("id", id)
		.single();

	return battleResult;
}

// Get battles by creator
export async function getBattlesByCreator() {
	const supabase = await createSupabaseServerClient();
	const { data: { user } } = await supabase.auth.getUser()
	console.log(user?.id);
	const id = user?.id
	const battleResult = await supabase
		.from("battles")
		.select("*")
		.eq("creator", id)
		.order("created_at", { ascending: false });

		console.log(battleResult);

	return battleResult;
}

// Get all active battles
export async function getActiveBattles(limit: number = 10, offset: number = 0) {
	const supabase = await createSupabaseServerClient();
	const battleResult = await supabase
		.from("battles")
		.select("*")
		.eq("status", true)
		.eq("is_active", true)
		.order("created_at", { ascending: false })
		.range(offset, offset + limit - 1);

	return battleResult;
}

// Get battles by category
export async function getBattlesByCategory(category: string, limit: number = 10) {
	const supabase = await createSupabaseServerClient();
	const battleResult = await supabase
		.from("battles")
		.select("*")
		.eq("category", category)
		.eq("status", true)
		.eq("is_active", true)
		.order("total_votes", { ascending: false })
		.limit(limit);

	return battleResult;
}

// Get trending battles (most votes in last 24 hours)
export async function getTrendingBattles(limit: number = 10) {
	const supabase = await createSupabaseServerClient();
	const battleResult = await supabase
		.from("battles")
		.select("*")
		.eq("status", true)
		.eq("is_active", true)
		.gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
		.order("total_votes", { ascending: false })
		.limit(limit);

	return battleResult;
}

// Update battle
export async function updateBattle(id: string, data: Partial<{
	title: string;
	participant_a_username: string;
	participant_b_username: string;
	participant_a_image: string;
	participant_b_image: string;
	participant_a_followers: string;
	participant_b_followers: string;
	description: string;
	status: boolean;
	voting_enabled: boolean;
	battle_duration: string;
	category: string;
}>) {
	const supabase = await createSupabaseServerClient();
	const battleResult = await supabase
		.from("battles")
		.update(data)
		.eq("id", id)
		.single();

	return battleResult;
}

// Delete battle
export async function deleteBattle(id: string) {
	const supabase = await createSupabaseServerClient();
	const battleResult = await supabase
		.from("battles")
		.delete()
		.eq("id", id);

	return battleResult;
}

// Cast a vote
export async function castVote(battleId: string, votedFor: 'A' | 'B', userId?: string, userIp?: string) {
	const supabase = await createSupabaseServerClient();
	
	// First check if battle is still active
	const { data: battle } = await supabase
		.from("battles")
		.select("ends_at, is_active, voting_enabled")
		.eq("id", battleId)
		.single();

	if (!battle || !battle.is_active || !battle.voting_enabled) {
		return { error: { message: "Battle is not accepting votes" } };
	}

	if (new Date(battle.ends_at) < new Date()) {
		return { error: { message: "Battle has ended" } };
	}

	const voteData: any = {
		battle_id: battleId,
		voted_for: votedFor,
	};

	if (userId) {
		voteData.user_id = userId;
	}
	if (userIp) {
		voteData.user_ip = userIp;
	}

	const voteResult = await supabase
		.from("battle_votes")
		.insert(voteData)
		.single();

	return voteResult;
}

// Get battle votes
export async function getBattleVotes(battleId: string) {
	const supabase = await createSupabaseServerClient();
	const votesResult = await supabase
		.from("battle_votes")
		.select("*")
		.eq("battle_id", battleId)
		.order("created_at", { ascending: false });

	return votesResult;
}

// Get user's vote for a specific battle
export async function getUserVote(battleId: string, userId?: string, userIp?: string) {
	const supabase = await createSupabaseServerClient();
	
	let query = supabase
		.from("battle_votes")
		.select("voted_for")
		.eq("battle_id", battleId);

	if (userId) {
		query = query.eq("user_id", userId);
	} else if (userIp) {
		query = query.eq("user_ip", userIp);
	} else {
		return { data: null, error: { message: "User ID or IP required" } };
	}

	const voteResult = await query.single();
	return voteResult;
}

// Get battle statistics
export async function getBattleStats(battleId: string) {
	const supabase = await createSupabaseServerClient();
	const statsResult = await supabase
		.from("battle_stats")
		.select("*")
		.eq("id", battleId)
		.single();

	return statsResult;
}

// Search battles
export async function searchBattles(query: string, limit: number = 10) {
	const supabase = await createSupabaseServerClient();
	const searchResult = await supabase
		.from("battles")
		.select("*")
		.eq("status", true)
		.or(`title.ilike.%${query}%,participant_a_username.ilike.%${query}%,participant_b_username.ilike.%${query}%,description.ilike.%${query}%`)
		.order("created_at", { ascending: false })
		.limit(limit);

	return searchResult;
}

// Get battle leaderboard (top voted battles)
export async function getBattleLeaderboard(limit: number = 20) {
	const supabase = await createSupabaseServerClient();
	const leaderboardResult = await supabase
		.from("battles")
		.select("*")
		.eq("status", true)
		.order("total_votes", { ascending: false })
		.limit(limit);

	return leaderboardResult;
}

// Get user's voting history
export async function getUserVotingHistory(userId: string, limit: number = 50) {
	const supabase = await createSupabaseServerClient();
	const historyResult = await supabase
		.from("battle_votes")
		.select(`
			*,
			battles:battle_id (
				title,
				slug,
				participant_a_username,
				participant_b_username
			)
		`)
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(limit);

	return historyResult;
}

// Deactivate expired battles (utility function)
export async function deactivateExpiredBattles() {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.rpc('deactivate_expired_battles');
	return result;
}

// Get battle analytics for creator
export async function getBattleAnalytics() {
	const supabase = await createSupabaseServerClient();
	const { data: { user } } = await supabase.auth.getUser()
	const id = user?.id
	
	// Get total battles, votes, and engagement stats
	const analyticsResult = await supabase
		.from("battles")
		.select(`
			id,
			title,
			created_at,
			total_votes,
			participant_a_votes,
			participant_b_votes,
			participant_a_username,
			participant_b_username,
			category,
			is_active,
			battle_votes (
				created_at
			)
		`)
		.eq("creator", id)
		.order("created_at", { ascending: false });


		console.log(analyticsResult);

	return analyticsResult;
}

export async function adddidigitalproduct(data: {
	product_title: string,
	product_description: string,
	category: string,
	price: number,
	discount_price: number,
	product_type: string, // digital_download, service, consultation
	delivery_method: string, // instant_download, email, scheduled_call
	tags: string,
	preview_images: string,
	product_files: string, // For downloadable products
	consultation_duration: string, // For consultation services
	available_slots: string, // For services
	skill_level: string, // beginner, intermediate, advanced
	software_requirements: string,
	file_formats: string,
	license_type: string, // personal, commercial, extended
	refund_policy: string, // no_refunds, 7_days, 30_days
	status: string, // draft, active, inactive
	featured: boolean,
	user_id: string, // This would be populated from your auth system
	
}) {

	const supabase = await createSupabaseServerClient();
	const productResult = await supabase
		.from("digital_products")
		.insert(data)
		.single();

    return productResult;
}

export async function createlesson(data: {
	catagory_id: number
	chapter_name: string
	image:string
	content: string 
	course_id: string 
	created_at: string
	description: string 
	instructor: string
	module_id: string 
	chapterno:string 
	slug: string 
	pdffiles:string
}) {

	const supabase = await createSupabaseServerClient();
	const blogResult = await supabase
		.from("chapters")
		.insert(data)
		.single();

    return blogResult;
}

export async function savepdf(pdfFile: File) {
	const supabase = await createSupabaseServerClient();
	const filedata = await supabase.storage
		.from("pdffiles")
		.upload(`pdf/${pdfFile.name}`, pdfFile, {
			cacheControl: '3600',
			upsert: false 
		  
		  });

		  console.log(filedata);

    return filedata;
}


export async function listallimages() {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.storage
    .from('images')
    .list('uploads', { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });

  if (error) {
    console.error('Error fetching images:', error);
    return [];
  }

  return data;
}

export async function createModule(data: {
	created_at?: string;
	module_name: string;
	module_description: string;
	module_number: number;
	course_id: string;
	slug: string;
	
}) {

	const supabase = await createSupabaseServerClient();
	const blogResult = await supabase
		.from("modules")
		.insert(data)
		.single();
	revalidatePath("/dashbaord/course/build");	
    return blogResult;
}

export async function createCourse(data: {
	banner_image: string;
	created_at: string;
	Catogory_id: string;
	Description: string;
	instructor: string; 
	Name: string;
	price: string;
	slug: string;
}) {
	const supabase = await createSupabaseServerClient();
	console.log("this is submitable data ", data);
	const CourseResult = await supabase
		.from("course")
		.insert(data)
		.single();
	console.log(CourseResult);	

    return CourseResult;
}


export async function readCatogries() {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("catagory")
		.select("*")
		.order("created_at", { ascending: true });
}
export async function readmodulescourse(id: string) {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("modules")
		.select("*")
		.eq("slug", id)
		.single();
}	



export async function readBlog() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("blog")
		.select("*")
		.eq("status", true)
		.range(0, 7)
		.order("created_at", { ascending: true });
}
export async function readchapter() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("chapters")
		.select("*")
		.range(0, 10)
		.order("created_at", { ascending: true });
}



export async function readmoreblog() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("blog")
		.select("*")
		.eq("status", true)
		.range(0, 35)
		.order("created_at", { ascending: true });
}


export async function readcourse() {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("course")
		.select("*")
		.order("created_at", { ascending: true });
}

export async function readBlogAdmin() {
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const supabase = await createSupabaseServerClient();
	const { data: { user } } = await supabase.auth.getUser()
	const id = user?.id



	return supabase
		.from("blog")
		.select("*")
		.eq('author', id || " " )
		.order("created_at", { ascending: true });
		
}

export async function Coursebyadmin() {
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const supabase = await createSupabaseServerClient();

	return supabase
		.from("course")
		.select("*")
		.eq('instructor', '5023e815-5c4a-4cfe-8607-18c263d0fbe3' )
		.order("created_at", { ascending: true });
		
}

export async function readBlogById(blogId: number) {
	const supabase = await createSupabaseServerClient();
	return supabase.from("blog").select("*").eq("id", blogId).single();
}
export async function readBlogIds() {
	const supabase = await createSupabaseServerClient();
	return supabase.from("blog").select("id");
}

export async function readBlogDeatailById(id : string) {
	const supabase = await createSupabaseServerClient();
	return await supabase
		.from("blog")
		.select("*")
		.eq("slug", id)
		.single();
}

export async function readcoursebyid(id : string) {
	const supabase = await createSupabaseServerClient();
	return await supabase
		.from("course")
		.select("*")
		.eq("slug", id)
		.single();
}
export async function readchapterdetailsbyid(id : string) {
	const supabase = await createSupabaseServerClient();
	return await supabase
		.from("chapters")
		.select("*")
		.eq("slug", id)
		.single();
}

export async function coursedetailsbyid(id : string) {
	const supabase = await createSupabaseServerClient();
	return await supabase
		.from("course")
		.select("*")
		.eq("slug", id)
		.single();
}



export async function getallimages() {
	const supabase = await createSupabaseServerClient();
	return await supabase.storage.from("images").list('images');
}

// export async function readBlogContent(blogId: string) {
// 	unstable_noStore();
// 	const supabase = await createSupabaseServerClient();
// 	return await supabase
// 		.from("blog_content")
// 		.select("content")
// 		.eq("blog_id", blogId)
// 		.single();
// }

export async function updateBlogById(blogId: string, data: IBlog) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("blog").update(data).eq("id", blogId);
	revalidatePath(DASHBOARD);
	revalidatePath("/blog/" + blogId);
	return JSON.stringify(result);
}

export async function deleteBlogById(blogId: string) {
	console.log("deleting blog post")
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("blog").delete().eq("id", blogId);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/blog/" + blogId);	
	return JSON.stringify(result);
}
export async function deleteCoursebyid(course_id: string) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("course").delete().eq("id", course_id);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/course/" + course_id);	
	return JSON.stringify(result);
}
export async function deleteModulebyid(mdoule_id: number) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("modules").delete().eq("id", mdoule_id);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/course/" + mdoule_id);	
	return JSON.stringify(result);
}
export async function deletechapterbyid(chapter_id: number) {
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("chapters").delete().eq("id", chapter_id);
	console.log(result);
	revalidatePath(DASHBOARD);
	revalidatePath("/course/" + chapter_id);
	return JSON.stringify(result);
}



export async function readmodulesbycourseId(courseId: string) {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	const supabase = await createSupabaseServerClient();
	return supabase.from("modules").select("*").eq("course_id", courseId).order("module_number", { ascending: true });

}

export async function readchaptersbymodule(module_id: string) {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("chapters")
		.select("module_id, chapter_name, slug, id, chapterno")
		.eq("module_id", module_id)
		.order("chapterno", { ascending: true });
}
export async function readchaptersbymodules(moduleIds: string[]) {
	const supabase = await createSupabaseServerClient();
	return supabase
		.from("chapters")
		.select("module_id, chapter_name, slug, id, chapterno")
		.in("module_id", moduleIds)
		.order("chapterno", { ascending: true });
}
export async function updatemodulebyid(id: number, data: IModule) {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	const supabase = await createSupabaseServerClient();
	const result = await supabase.from("modules").update(data).eq("id", id);
	revalidatePath(DASHBOARD);
	return JSON.stringify(result);
}