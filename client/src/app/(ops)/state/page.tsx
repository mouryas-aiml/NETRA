import { AppRail } from '@/components/shell/AppRail'

export default function StatePage() {
	return (
		<div className="min-h-screen bg-[--ink-900] pl-[--rail-w]">
			<AppRail />
			<main className="grid min-h-screen place-items-center px-6 text-center text-[--txt-2]">
			<section className="max-w-xl">
				<p className="type-micro text-[--critical]">STATE INTELLIGENCE DATA BLOCKED</p>
				<h1 className="mt-3 text-2xl font-semibold text-[--txt]">Official state inputs are required</h1>
				<p className="mt-3 text-sm leading-6">
					This view is unavailable until the official 2011 Census workbook and Bharat Maps
					district source are restored. No placeholder state figures are shown.
				</p>
			</section>
			</main>
		</div>
	)
}
