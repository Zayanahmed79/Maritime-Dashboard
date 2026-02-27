"use client"

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PlayCircle, Video } from 'lucide-react'

const videos = [
  {
    id: 'part1',
    en_title: 'Commercial Fishing Guide (Part 1)',
    ur_title: '(حصہ 1) کمرشل فشنگ گائیڈ',
    bal_title: 'کمرشل فشنگ گائیڈ (بہر 1)',
    en_subtitle: 'Boat & MMD Registration',
    ur_subtitle: 'بوٹ اور ایم ایم ڈی رجسٹریشن',
    bal_subtitle: 'بوٹ ءُ ایم ایم ڈی رجسٹریشن',
    src: '/videos/part1.mp4'
  },
  {
    id: 'part2',
    en_title: 'Commercial Fishing Guide (Part 2)',
    ur_title: '(حصہ 2) کمرشل فشنگ گائیڈ',
    bal_title: 'کمرشل فشنگ گائیڈ (بہر 2)',
    en_subtitle: 'KFHA Clearance & Sindh Fishing License',
    ur_subtitle: 'کے ایف ایچ اے کلیئرنس اور سندھ فشنگ لائسنس',
    bal_subtitle: 'کے ایف ایچ اے کلیئرنس ءُ سندھ فشنگ لائسنس',
    src: '/videos/part2.mp4'
  },
  {
    id: 'part3',
    en_title: 'Commercial Fishing Guide (Part 3)',
    ur_title: '(حصہ 3) کمرشل فشنگ گائیڈ',
    bal_title: 'کمرشل فشنگ گائیڈ (بہر 3)',
    en_subtitle: 'Customs Permit & Going to Sea',
    ur_subtitle: 'کسٹمز پرمٹ اور سمندر میں جانا',
    bal_subtitle: 'کسٹمز پرمٹ ءُ زر ءَ روگ',
    src: '/videos/part3.mp4'
  }
]

export function VideoGuidelines() {
  const { isUrdu, isBalochi } = useLanguage()
  const [selectedVideoId, setSelectedVideoId] = useState(videos[0].id)

  const selectedVideo = videos.find(v => v.id === selectedVideoId) || videos[0]
  const isRtl = isUrdu || isBalochi

  return (
    <Card className={`${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          {isBalochi ? 'ویڈیو گائیڈ لائنز' : isUrdu ? 'ویڈیو گائیڈ لائنز' : 'Video Guidelines'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 justify-start mt-2">
              <PlayCircle className="w-5 h-5" />
              {isBalochi ? 'ہدایات ءِ ویڈیوز گند' : isUrdu ? 'ہدایات کی ویڈیوز دیکھیں' : 'Watch Guidelines'}
            </Button>
          </DialogTrigger>
          <DialogContent className={`max-w-[95vw] xl:max-w-6xl p-0 overflow-hidden bg-background ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
            <DialogHeader className="p-4 sm:p-5 pb-3">
              <DialogTitle className="text-xl">
                {isBalochi ? 'کمرشل فشنگ گائیڈ لائنز' : isUrdu ? 'کمرشل فشنگ گائیڈ لائنز' : 'Commercial Fishing Guidelines'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x border-t w-full">
              {/* Left Side: Playlist */}
              <div className="w-full md:w-[320px] shrink-0 flex flex-col h-[40vh] md:h-[70vh] overflow-y-auto p-4 space-y-3 bg-muted/30">
                <h3 className="font-semibold text-sm mb-2 px-1">
                  {isBalochi ? 'ویڈیوز ءِ فہرست' : isUrdu ? 'ویڈیوز کی فہرست' : 'Video Playlist'}
                </h3>
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideoId(video.id)}
                    className={`flex flex-col items-start p-3 rounded-lg text-left transition-colors border ${selectedVideo.id === video.id
                        ? 'bg-primary/10 border-primary/30 shadow-sm'
                        : 'bg-background hover:bg-muted border-transparent'
                      }`}
                  >
                    <span className={`font-medium text-sm ${isRtl ? 'text-right w-full' : ''} ${selectedVideo.id === video.id ? 'text-primary' : ''}`}>
                      {isBalochi ? video.bal_title : isUrdu ? video.ur_title : video.en_title}
                    </span>
                    <span className={`text-xs text-muted-foreground mt-1 ${isRtl ? 'text-right w-full' : ''}`}>
                      {isBalochi ? video.bal_subtitle : isUrdu ? video.ur_subtitle : video.en_subtitle}
                    </span>
                  </button>
                ))}
              </div>

              {/* Right Side: Video Player */}
              <div className="flex-1 bg-black flex flex-col relative h-[40vh] md:h-auto overflow-hidden">
                <style dangerouslySetInnerHTML={{
                  __html: `
                  video::-webkit-media-text-track-display {
                    display: none !important;
                  }
                  video::cue {
                    color: transparent;
                    background: transparent;
                  }
                `}} />
                <video
                  key={selectedVideo.src}
                  src={selectedVideo.src}
                  controls
                  autoPlay
                  className="w-full h-full md:absolute md:inset-0 object-contain [&::cue]:hidden [&::-webkit-media-text-track-display]:hidden"
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10">
                  <h2 className="text-white font-semibold flex flex-col drop-shadow-md">
                    <span>{isBalochi ? selectedVideo.bal_title : isUrdu ? selectedVideo.ur_title : selectedVideo.en_title}</span>
                    <span className="text-sm font-normal text-white/80">{isBalochi ? selectedVideo.bal_subtitle : isUrdu ? selectedVideo.ur_subtitle : selectedVideo.en_subtitle}</span>
                  </h2>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
