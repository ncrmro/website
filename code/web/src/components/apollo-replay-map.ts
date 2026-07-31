// Interactive ground-track view of the Apollo 11 open-loop bank-replay
// simulation, rendered as a deck.gl island (no basemap, no Cesium —
// just the track over a graticule). The path is colored by the
// digitized |bank| command so the reader can see the chart from the
// post acting on the trajectory. Longitudes in the data are unwrapped
// (continuous west of -180) because the entry crosses the antimeridian.
//
// Browser-only: this module is imported dynamically from the island's
// inline script, never from Astro frontmatter. deck.gl's dependency tree
// pulls Node builtins (worker_threads) that the Cloudflare SSR
// environment refuses, so it must not be reachable from the server graph.

import { Deck, MapView } from '@deck.gl/core';
import type { PickingInfo } from '@deck.gl/core';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer, LineLayer, PathLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import replay from '../data/apollo-replay.json';

interface TrackPoint {
	t: number;
	lon: number;
	lat: number;
	alt: number;
	bank: number;
	phase: string;
}

const track = replay.track as TrackPoint[];
const { ei, truth, impact } = replay;

// |bank| 0..180 -> cool-to-hot ramp (lift-up cruise vs hard reversals).
function bankColor(bank: number): [number, number, number] {
	const x = Math.min(Math.abs(bank) / 180, 1);
	return [60 + 195 * x, 130 - 40 * x, 255 - 215 * x];
}

// Consecutive-pair segments so each can carry its own bank color.
const segments = track.slice(0, -1).map((p, i) => ({
	from: p,
	to: track[i + 1],
}));

// Graticule over the track's bounding box (5-degree grid).
const graticule: { path: [number, number][] }[] = [];
for (let lon = -190; lon <= -165; lon += 5) {
	graticule.push({ path: [[lon, -10], [lon, 20]] });
}
for (let lat = -10; lat <= 20; lat += 5) {
	graticule.push({ path: [[-190, lat], [-165, lat]] });
}

// Layers are constructed per Deck instance — deck.gl layers carry
// internal state and cannot be shared between two Deck instances (the
// post mounts this island twice).
function makeLayers() {
	return [
		// Esri World Imagery (satellite, color); the MapView repeats
		// worlds so the unwrapped longitudes (west of -180) land on the
		// adjacent copy.
		new TileLayer({
			id: 'basemap',
			data: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			minZoom: 0,
			maxZoom: 19,
			tileSize: 256,
			renderSubLayers: (props) => {
				const { boundingBox } = props.tile;
				return new BitmapLayer(props, {
					data: undefined,
					image: props.data,
					bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]],
				});
			},
		}),
		new PathLayer({
			id: 'graticule',
			data: graticule,
			getPath: (d: { path: [number, number][] }) => d.path,
			getColor: [255, 255, 255, 15],
			getWidth: 1,
			widthUnits: 'pixels',
		}),
		new LineLayer({
			id: 'track',
			data: segments,
			getSourcePosition: (d: { from: TrackPoint }) => [d.from.lon, d.from.lat],
			getTargetPosition: (d: { to: TrackPoint }) => [d.to.lon, d.to.lat],
			getColor: (d: { from: TrackPoint }) => bankColor(d.from.bank),
			getWidth: 3,
			widthUnits: 'pixels',
			pickable: true,
		}),
		new LineLayer({
			id: 'miss',
			data: [
				{
					from: [impact.lon, impact.lat] as [number, number],
					to: [truth.lon, truth.lat] as [number, number],
				},
			],
			getSourcePosition: (d: { from: [number, number] }) => d.from,
			getTargetPosition: (d: { to: [number, number] }) => d.to,
			getColor: [255, 196, 0, 220],
			getWidth: 2,
			widthUnits: 'pixels',
		}),
		new ScatterplotLayer({
			id: 'markers',
			data: [
				{ pos: [ei.lon, ei.lat] as [number, number], color: [120, 220, 120], label: ei.label },
				{ pos: [truth.lon, truth.lat] as [number, number], color: [255, 196, 0], label: truth.label },
				{ pos: [impact.lon, impact.lat] as [number, number], color: [255, 90, 90], label: 'Simulated impact (replay)' },
			],
			getPosition: (d: { pos: [number, number] }) => d.pos,
			getFillColor: (d: { color: [number, number, number] }) => d.color,
			getRadius: 5,
			radiusUnits: 'pixels',
			pickable: true,
		}),
		new TextLayer({
			id: 'labels',
			data: [
				{ pos: [ei.lon + 0.5, ei.lat - 0.8] as [number, number], text: 'Entry interface', anchor: 'start' },
				{ pos: [truth.lon + 0.6, truth.lat + 0.6] as [number, number], text: 'actual splashdown', anchor: 'start' },
				{ pos: [impact.lon - 0.6, impact.lat - 0.6] as [number, number], text: 'simulated impact\n867 km short, 14 km cross-track', anchor: 'end' },
			],
			getPosition: (d: { pos: [number, number] }) => d.pos,
			getText: (d: { text: string }) => d.text,
			getTextAnchor: (d: { anchor: string }) => d.anchor as 'start' | 'end',
			getAlignmentBaseline: 'top',
			getSize: 12,
			getColor: [230, 237, 243, 230],
			background: true,
			getBackgroundColor: [11, 18, 32, 180],
			backgroundPadding: [4, 2],
		}),
	];
}

function tooltip(info: PickingInfo): { text: string } | null {
	const obj = info.object as { from?: TrackPoint; label?: string } | undefined;
	if (!obj) return null;
	if (obj.label) return { text: obj.label };
	if (obj.from) {
		const p = obj.from;
		return {
			text: `t = ${p.t.toFixed(0)} s after entry\nalt ${p.alt.toFixed(1)} km · bank ${p.bank.toFixed(0)}°\nphase: ${p.phase}`,
		};
	}
	return null;
}

/** Mounts one Deck instance into the given container. */
export function mount(container: HTMLDivElement): Deck<MapView> {
	return new Deck({
		parent: container,
		views: new MapView({ repeat: true }),
		initialViewState: { longitude: -175.5, latitude: 7.0, zoom: 3.2, minZoom: 2.5, maxZoom: 9 },
		controller: { scrollZoom: false },
		layers: makeLayers(),
		getTooltip: tooltip,
	});
}
