import Image from "next/image";

interface Props {
    imgUrl: string;
    expertise: string;
    heading: string;
    content: string;
}

export const expertCardData = [
    {
        imgUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww",
        expertise: "Nutrition",
        heading: "Personal Nutritionist",
        content: "Customized diet plans & meal guidance"
    },
    {
        imgUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=689&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=689&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        expertise: "Fitness",
        heading: "Personal Trainer",
        content: "Fitness routines & lifestyle coaching"
    },
    {
        imgUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9jdG9yfGVufDB8fDB8fHww",
        expertise: "Pharmacy",
        heading: "Medicine & suppliments advisor",
        content: "Safe OTC & supplement recommendations"
    },
    {
        imgUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZG9jdG9yfGVufDB8fDB8fHww",
        expertise: "Wellness",
        heading: "Wellness Coach",
        content: "Mental wellness & stress management"
    }
]

export default function ExpertCard({imgUrl, expertise, heading, content}: Props) {
  return (
    <div
      className="p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: "0ms" }}
    >
      <div className="flex items-center justify-between">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Image
            src={imgUrl}
            alt="expert-1"
            height={64}
            width={64}
            className="w-16 h-16 object-cover rounded-full"
          />
        </div>
        <div className="self-start flex gap-2 bg-accent px-2 py-1 rounded-2xl items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent-foreground"></div>
          <p className="text-accent-foreground text-xs">Available</p>
        </div>
      </div>
      <p className="text-accent-foreground text-sm">{expertise}</p>
      <h3 className="font-semibold text-foreground mb-1">
        {heading}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {content}
      </p>
    </div>
  );
}
