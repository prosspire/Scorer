import React from "react";
import { getBattleBySlug } from "@/lib/actions/blog";
import { SITE_URL } from "@/app/config";
import BattleContent from "./components/BattleContent";
import { Metadata } from 'next';

interface Battle {
  id: string;
  title: string;
  participant_a_username: string;
  participant_b_username: string;
  participant_a_image?: string;
  participant_b_image?: string;
  participant_a_followers: string;
  participant_b_followers: string;
  participant_a_votes: number;
  participant_b_votes: number;
  total_votes: number;
  description: string;
  slug: string;
  category: string;
  created_at: string;
  ends_at: string;
  is_active: boolean;
  creator: string;
  voting_enabled: boolean;
  battle_duration: string;
}

// Generate static params for battle slugs
// export async function generateStaticParams() {
//   try {
//     const { data: battles, error } = await supabase
//       .from("battles")
//       .select("slug")
//       .eq("status", true);
    
//     if (error) {
//       console.error("Error generating static params:", error);
//       return [];
//     }

//     return battles?.map((battle) => ({ slug: battle.slug })) || [];
//   } catch (error) {
//     console.error("Error in generateStaticParams:", error);
//     return [];
//   }
// }

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { data: battle, error } = await getBattleBySlug(params.id);
    
    if (error || !battle) {
      return {
        title: "Battle Not Found | Famosa",
        description: "The requested battle could not be found.",
      };
    }

    const battleTitle = `${battle.participant_a_username} VS ${battle.participant_b_username} | Famosa Battle`;
    const battleDescription = battle.description || 
      `Epic Instagram showdown: @${battle.participant_a_username} vs @${battle.participant_b_username}. ${battle.total_votes} votes and counting! Vote now on Famosa.`;
    
    const battleImage = battle.participant_a_image || 
      battle.participant_b_image || 
      `${SITE_URL}/og-battle-default.jpg`;

    return {
      title: battleTitle,
      description: battleDescription,
      openGraph: {
        title: battleTitle,
        description: battleDescription,
        url: `${SITE_URL}/battle/${params.id}`,
        siteName: "Famosa",
        images: [
          {
            url: battleImage,
            width: 1200,
            height: 630,
            alt: `${battle.participant_a_username} vs ${battle.participant_b_username}`,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: battleTitle,
        description: battleDescription,
        images: [battleImage],
      },
      keywords: [
        "instagram battle",
        "profile comparison",
        "social media showdown",
        battle.participant_a_username,
        battle.participant_b_username,
        battle.category,
        "vote",
        "famosa"
      ],
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Battle | Famosa",
      description: "Vote in epic Instagram profile battles on Famosa.",
    };
  }
}

export default async function BattlePage({ params }: { params: { id: string } }) {
  try {
    // Fetch battle data
    console.log("Fetching battle data for slug:", params.id);
    const { data: battle, error } = await getBattleBySlug(params.id);

    if (error) {
      console.error("Error fetching battle:", error);
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Battle Not Found</h1>
            <p className="text-gray-400 mb-6">The battle you're looking for doesn't exist or has been removed.</p>
            <a href="/battle" className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
              Browse Active Battles
            </a>
          </div>
        </div>
      );
    }

    if (!battle) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-400 mb-4">Battle Not Found</h1>
            <p className="text-gray-500 mb-6">This battle doesn't exist.</p>
            <a href="/battles" className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
              Browse Active Battles
            </a>
          </div>
        </div>
      );
    }

    // Check if battle has ended
    const hasEnded = new Date(battle.ends_at) < new Date();
    const isActive = battle.is_active && !hasEnded;

    return (
      <div className="min-h-screen bg-black text-white">
        <BattleContent 
          battle={battle} 
          isActive={isActive}
          hasEnded={hasEnded}
        />
      </div>
    );

  } catch (error) {
    console.error("Error in BattlePage:", error);
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
          <p className="text-gray-400 mb-6">We encountered an error loading this battle.</p>
          <a href="/battles" className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
            Browse Active Battles
          </a>
        </div>
      </div>
    );
  }
}