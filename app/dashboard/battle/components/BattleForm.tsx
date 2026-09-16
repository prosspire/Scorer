"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState, useTransition, useMemo } from "react";
import { useUser } from "@/lib/store/user";
import { Button } from "@/components/ui/button";
import slugify from "slugify";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IBattleDetail } from "@/lib/types";
import { BattleFormSchemaType } from "../schema";
// import { onUploadImageAction } from "./feats/file/actions/image-upload.action";
import { 
  Copy, 
  Check, 
  Upload, 
  X, 
  Plus, 
  Instagram,
  User,
  Trophy,
  Eye,
  Users,
  Calendar,
  Hash,
  Globe,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Loader2,
  Monitor,
  Maximize2,
  Minimize2,
  Crown,
  Flame,
  Heart,
  Star,
  Camera,
  Clock,
  Coins,
  Sparkles
} from "lucide-react";
// import Footer from "@/components/Footer";
// import ImageGallery from "./ImageGallery";

interface BattleFormProps {
  defaultBattle: IBattleDetail;
  onHandleSubmit: (data: BattleFormSchemaType) => void;
}

export default function BattleForm({ onHandleSubmit, defaultBattle }: BattleFormProps) {
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');
  const [isPending, startTransition] = useTransition();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);

  const user = useUser((state) => state.user);

  const form = useForm<BattleFormSchemaType>({
    mode: "all",
    defaultValues: {
      title: defaultBattle?.title || "",
      participant_a_username: defaultBattle?.participant_a_username || "",
      participant_b_username: defaultBattle?.participant_b_username || "",
      participant_a_image: defaultBattle?.participant_a_image || "",
      participant_b_image: defaultBattle?.participant_b_image || "",
      participant_a_followers: defaultBattle?.participant_a_followers || "",
      participant_b_followers: defaultBattle?.participant_b_followers || "",
      description: defaultBattle?.description || "",
      status: defaultBattle?.status || true,
      creator: defaultBattle?.creator || "",
      created_at: defaultBattle?.created_at || "",
      slug: defaultBattle?.slug || "",
      voting_enabled: defaultBattle?.voting_enabled || true,
      battle_duration: defaultBattle?.battle_duration || "24",
      category: defaultBattle?.category || "general",
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = (data: BattleFormSchemaType) => {
    startTransition(() => {
      onHandleSubmit(data);
    });
  };

  // Generate battle slug when usernames change
  useEffect(() => {
    const participantA = form.getValues().participant_a_username;
    const participantB = form.getValues().participant_b_username;
    
    if (participantA && participantB && user?.id) {
      const slug = `${slugify(participantA, { lower: true })}_VS_${slugify(participantB, { lower: true })}_${Date.now()}`;
      form.setValue("slug", slug);
      form.setValue("creator", user?.id);
      form.setValue("created_at", new Date().toISOString().slice(0, 16));
      
      if (!form.getValues().title) {
        form.setValue("title", `${participantA} VS ${participantB}`);
      }
    }
  }, [
    form.getValues().participant_a_username, 
    form.getValues().participant_b_username, 
    user?.id, 
    form
  ]);

  const formStatus = form.formState.isValid ? "Ready" : "Incomplete";
  const battleUrl = form.getValues().slug ? `${window?.location?.origin}/battle/${form.getValues().slug}` : "";

  const copyBattleUrl = async () => {
    if (battleUrl) {
      await navigator.clipboard.writeText(battleUrl);
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 2000);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Battle preview component
  const BattlePreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {form.getValues().title || "Battle Title"}
        </h2>
        <p className="text-gray-600">
          {form.getValues().description || "Battle description will appear here"}
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
          {/* Participant A */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-3xl p-4 border-2 border-red-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    {form.getValues().participant_a_image ? (
                      <img 
                        src={form.getValues().participant_a_image} 
                        alt="Participant A"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-red-500 rounded-full px-2 py-1 text-xs font-bold">
                    RED
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold">
                    @{form.getValues().participant_a_username || "participant_a"}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Instagram className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-gray-300">
                      {form.getValues().participant_a_followers || "0"} followers
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-red-400 mb-2">0</div>
                <div className="text-red-300 text-sm font-medium">VOTES</div>
              </div>
            </div>
          </div>

          {/* VS Section */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-black text-xl">
              VS
            </div>
          </div>

          {/* Participant B */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl p-4 border-2 border-blue-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    {form.getValues().participant_b_image ? (
                      <img 
                        src={form.getValues().participant_b_image} 
                        alt="Participant B"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full px-2 py-1 text-xs font-bold">
                    BLUE
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold">
                    @{form.getValues().participant_b_username || "participant_b"}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Instagram className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-300">
                      {form.getValues().participant_b_followers || "0"} followers
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-blue-400 mb-2">0</div>
                <div className="text-blue-300 text-sm font-medium">VOTES</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-lg font-bold text-purple-400">0</div>
            <div className="text-gray-400">Total Votes</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {form.getValues().battle_duration}h
            </div>
            <div className="text-gray-400">Duration</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">
              {form.getValues().category || "General"}
            </div>
            <div className="text-gray-400">Category</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-6 px-6 bg-gray-50 text-gray-700">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-purple-600" />
            <span className="text-gray-800 font-medium">Battle Creator</span>
            <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              Create Epic Showdowns
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleTimeString()} | {user?.email || "Guest"}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 border-b border-gray-200 p-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Status:</span>
              <span className={`${formStatus === "Ready" ? "text-green-600" : "text-orange-600"}`}>
                {formStatus}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Mode:</span>
              <span className="text-blue-600 capitalize">{viewMode}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Cost:</span>
              <span className="text-purple-600 font-semibold">₹50</span>
            </div>
          </div>
           
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setShowImageGallery(!showImageGallery)}
              variant="outline"
              size="sm"
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <ImageIcon className="w-4 h-4" />
              {showImageGallery ? 'Hide Gallery' : 'Gallery'}
            </Button>
            {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
            <span className="text-gray-600">
              {isPending ? "Creating..." : "Ready"}
            </span>
          </div>
        </div>
      </div>

      <Form {...form}>
        {/* Control Panel */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* View Mode Controls */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  type="button"
                  onClick={() => setViewMode('form')}
                  variant={viewMode === 'form' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 ${viewMode === 'form' ? 'bg-white text-purple-600 shadow-sm' : ''}`}
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Battle Form
                </Button>
                <Button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 ${viewMode === 'preview' ? 'bg-white text-purple-600 shadow-sm' : ''}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>

              <Button
                type="button"
                onClick={toggleFullscreen}
                variant="outline"
                size="sm"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4 mr-1" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 mr-1" />
                    Fullscreen
                  </>
                )}
              </Button>
            </div>
            
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!form.formState.isValid || isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Battle...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Create Battle (₹50)
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-50 pt-0' : 'p-6'}`}>
          <div className={`${isFullscreen ? 'h-full p-6 overflow-auto' : 'max-w-6xl mx-auto'} space-y-6`}>
            
            {viewMode === 'form' ? (
              <>
                {/* Battle Title */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-800 font-semibold">Battle Details</span>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Battle Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Epic Influencer Showdown..."
                              {...field}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what makes this battle exciting..."
                              {...field}
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-24"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Participants */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Participant A */}
                  <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <span className="text-gray-800 font-semibold">Red Team Participant</span>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="participant_a_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Instagram Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Instagram className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Input
                                  placeholder="its_ashish_001"
                                  {...field}
                                  className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="participant_a_followers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Followers Count</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="524K"
                                {...field}
                                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="participant_a_image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Profile Image URL</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="https://..."
                                  {...field}
                                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowImageGallery(true)}
                                  className="px-3"
                                >
                                  <Upload className="w-4 h-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Participant B */}
                  <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">B</span>
                      </div>
                      <span className="text-gray-800 font-semibold">Blue Team Participant</span>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="participant_b_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Instagram Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Instagram className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Input
                                  placeholder="its_rohit"
                                  {...field}
                                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="participant_b_followers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Followers Count</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="892K"
                                {...field}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="participant_b_image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Profile Image URL</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="https://..."
                                  {...field}
                                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowImageGallery(true)}
                                  className="px-3"
                                >
                                  <Upload className="w-4 h-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Battle Settings */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-800 font-semibold">Battle Configuration</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-purple-500">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="lifestyle">Lifestyle</SelectItem>
                              <SelectItem value="fitness">Fitness</SelectItem>
                              <SelectItem value="fashion">Fashion</SelectItem>
                              <SelectItem value="tech">Tech</SelectItem>
                              <SelectItem value="entertainment">Entertainment</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="battle_duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Duration (hours)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-purple-500">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 Hour</SelectItem>
                              <SelectItem value="6">6 Hours</SelectItem>
                              <SelectItem value="12">12 Hours</SelectItem>
                              <SelectItem value="24">24 Hours</SelectItem>
                              <SelectItem value="48">48 Hours</SelectItem>
                              <SelectItem value="168">7 Days</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name="voting_enabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-gray-700">Enable Voting</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Battle URL Preview */}
                {form.getValues().slug && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Hash className="w-5 h-5 text-green-600" />
                      <span className="text-gray-800 font-semibold">Battle URL</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <code className="flex-1 text-sm text-gray-700 break-all">
                        {battleUrl}
                      </code>
                      <Button
                        type="button"
                        onClick={copyBattleUrl}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {copiedSlug ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Preview Mode */
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-800 font-semibold">Battle Preview</span>
                </div>
                <BattlePreview />
              </div>
            )}
          </div>
        </div>
      </Form>


      </div>


	);

}