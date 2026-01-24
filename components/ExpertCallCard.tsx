import { Video, Phone } from 'lucide-react';
import Link from 'next/link';

interface ExpertCallCardProps {
	doctorName?: string;
	price?: string;
	imageUrl?: string;
	onCall?: () => void;
}

export default function ExpertCallCard({
	doctorName = "Dr. Sarah",
	price = "$5/session",
	imageUrl = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
	onCall
}: ExpertCallCardProps) {
	return (
		<div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/95 to-primary/80 p-4 w-88">
			{/* Decorative Background Blobs */}
			<div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>
			<div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>

			<div className="relative flex items-center gap-3">
				{/* Avatar with Status Indicator */}
				<div className="relative">
					<img
						src={imageUrl}
						alt={`${doctorName} - Health Expert`}
						className="w-14 h-14 rounded-xl object-cover border-2 border-white/30 shadow-lg"
					/>
					<span className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-primary flex items-center justify-center">
						<Video className="w-2 h-2 text-accent-foreground" />
					</span>
				</div>

				{/* Text Info */}
				<div className="flex-1">
					<h4 className="text-sm font-semibold text-primary-foreground leading-tight">
						Talk to an Expert
					</h4>
					<p className="text-xs text-primary-foreground/80 mt-0.5">
						Instant 1-on-1 video call
					</p>
					<p className="text-[10px] text-primary-foreground/60 mt-0.5 font-medium">
						Available now • {price}
					</p>
				</div>
			</div>

			{/* Action Button */}
			<Link
				href={'/allAdvisors'}
				onClick={onCall}
				className="mt-3 w-full py-2.5 bg-white hover:bg-white/95 text-primary text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
			>
				<Phone className="w-4 h-4 fill-current" />
				Start Video Call Now
			</Link>
		</div>
	);
}