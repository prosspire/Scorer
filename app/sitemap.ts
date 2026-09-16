import type { MetadataRoute } from 'next'
import { readBlog, readchapter } from "@/lib/actions/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap>  {
    let { data: blogs } = await readBlog();
    let { data: chapters } = await readchapter();

    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

    // Map blogs to postEntries with required properties
    const postEntries: MetadataRoute.Sitemap = blogs?.map((blog: any) => ({
        url: `${siteUrl}/blog/${blog?.slug}`,
        lastModified: new Date(blog.created_at),
        changeFrequency: 'weekly',
        priority: 0.5,
    })) || [];

    const chapterentries: MetadataRoute.Sitemap = chapters?.map((chapter: any) => ({
        url: `${siteUrl}/chapter/${chapter?.slug}`,
        lastModified: new Date(chapter.created_at),
        changeFrequency: 'weekly',
        priority: 0.5,
    })) || [];

    // Static entries for aboutus, privacypolicy, contactus, etc.
    const staticEntries: MetadataRoute.Sitemap = [
        { 
            url: `${siteUrl}`, 
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1 
        },
        { 
            url: `${siteUrl}/aboutus`, 
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8 
        },
        { 
            url: `${siteUrl}/contactus`, 
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8 
        },
        { 
            url: `${siteUrl}/privacypolicy`, 
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.8 
        },
    ];

    // Combine static entries with postEntries
    const allEntries: MetadataRoute.Sitemap = [...staticEntries, ...postEntries, ...chapterentries];

    return allEntries;
}
