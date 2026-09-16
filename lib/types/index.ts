    export type IBlog = {
		author: string | null
		coments_enabled: boolean | null
		content: string 
		created_at: string
		id: string
		image: string | null
		meta_description: string | null
		meta_tiltle: string | null
		published_at: string
		slug: string
		status: boolean
		title: string | null
};


export type IBattleDetail = {
  id: "",
  title: "",
  participant_a_username: "",
  participant_b_username: "",
  participant_a_image: "",
  participant_b_image: "",
  participant_a_followers: "",
  participant_b_followers: "",
  description: "",
  status: true,
  creator: "",
  created_at: "",
  slug: "",
  voting_enabled: true,
  battle_duration: "24",
  category: "general",
  // Optional backend fields with default values
  participant_a_votes: 0,
  participant_b_votes: 0,
  total_votes: 0,
  ends_at: "",
  is_active: true,
};
export type IchapterDetails = {
	catagory_id: number
	chapter_name: string | null
	content: string | null
	course_id: string 
	created_at: string
	image: string 
	description: string | null
	id: number
	instructor: string
	module_id: string 
	chapterno:string 
	slug: string 
	pdffiles:string
};
export type IchapterModules = {
	chapter_name: string | null
	chapterno:string 
	slug: string 
	module_id: string};

export type IModule = {
   id: number
   created_at: string;
   module_name: string;
   module_description: string;
   module_number: number;
   course_id: string;
   slug:string;
};

export type IModules = {
	course_id: string;
    created_at: string;
    id: number;
    module_description: string;
    module_name: string;
    module_number: number;
    slug: string;
 }[];

export type IAuthor = {
	author: string 
	Bio: string | null
	created_at: string
	github: string 
	id: string
	instagram: string 
	linkdin: string 
	Name: string 
	twiter: string 
	profile:string
} ;
export type Icourse ={
	id: string;
	banner_image: string;
	Catogory_id: string;
	created_at: string;
	Description: string;
	instructor: string;
	Name: string;
	price: string;
	slug:string;
} ;
export type IcourseSubmit ={
	banner_image: string;
	Catogory_id: string;
	created_at: string;
	Description: string;
	instructor: string;
	Name: string;
	price: string;
	slug:string;
} ;
export type Coments ={
	coment: string;
    created_at: string;
    slug_id: string;
    user_id: string;
} ;
export type Catagories ={
	created_at: string
	description: string
	id: number
	name: string
  };


export type IBlogForm = {
	created_at: string;
	id: string;
	image: string;
	is_premium: boolean;
	is_published: boolean;
	title: string;
	blog_content: {
		blog_id: string;
		content: string;
		created_at: string;
	};
};

export type Iuser = {
	created_at: string;
	display_name: string;
	email: string;
	id: string;
	image_url: string;
	role: string;
	stripe_customer_id: string | null;
	stripe_subscriptoin_id: string | null;
	subscription_status: boolean;
} | null;
