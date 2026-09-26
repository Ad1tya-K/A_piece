/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Layers, Activity, Download, Radio, HardDrive, Server, Zap, DollarSign, 
  Gavel, ArrowRight, CheckCircle, Terminal, Menu, X, Shield, 
  FileText, RefreshCw, Plus, Search, Play
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'cluster-health' | 'storage-auctions' | 'benchmarks' | 'documentation' | 's3-storage'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interactive state for auctions simulator
  const [auctionsList, setAuctionsList] = useState([
    { id: '#8942-XA', shard: 'Shard #8942-XA', winner: 'US-East-04', price: '$0.00041', size: '128 MB', latency: '0.94ms', status: 'Verified' },
    { id: '#8941-TK', shard: 'Shard #8941-TK', winner: 'Oregon-12', price: '$0.00038', size: '256 MB', latency: '1.02ms', status: 'Verified' },
    { id: '#8940-FR', shard: 'Shard #8940-FR', winner: 'Frankfurt-08', price: '$0.00044', size: '64 MB', latency: '0.88ms', status: 'Verified' },
    { id: '#8939-TY', shard: 'Shard #8939-TY', winner: 'Tokyo-03', price: '$0.00049', size: '512 MB', latency: '1.15ms', status: 'Verified' },
  ]);

  // Node fleet state
  const [nodes] = useState([
    { id: 'node-us-east-0104', rack: 'Ashburn DC-01 Rack 14-U22', controller: 'Dual Micron 9400 Pro (30.72TB)', iops: '124k / 160k', health: '99.8% (0 Bad Sectors)', status: 'Active Quorum' },
    { id: 'node-us-west-0442', rack: 'Oregon DC-02 Rack 08-U11', controller: 'Samsung PM1733 PCIe Gen4', iops: '98k / 140k', health: '100% (0 Bad Sectors)', status: 'Active Quorum' },
    { id: 'node-eu-cent-0891', rack: 'Frankfurt DC-03 Rack 03-U04', controller: 'Kioxia CM6 Enterprise NVMe', iops: '18k / 150k', health: '94.1% (Pending Realloc)', status: 'Draining (82%)' },
    { id: 'node-ap-east-0219', rack: 'Tokyo DC-04 Rack 19-U38', controller: 'Solidigm D7-P5520 QLC U.2', iops: '110k / 160k', health: '99.9% (0 Bad Sectors)', status: 'Active Quorum' },
  ]);

  // S3 Bucket Simulator state
  const [objects, setObjects] = useState([
    { key: 'datasets/genomics-2026.parquet', bucket: 'vault-ml-bucket', size: '14.2 GB', chunks: 1775, replicas: 3, checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', created: '2026-09-25 12:10 UTC' },
    { key: 'checkpoints/llm-omni-v3.bin', bucket: 'vault-ai-models', size: '48.6 GB', chunks: 6075, replicas: 3, checksum: 'sha256:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4', created: '2026-09-25 10:42 UTC' },
    { key: 'telemetry/metrics-epoch-8421.ndjson', bucket: 'vault-telemetry', size: '2.1 GB', chunks: 262, replicas: 2, checksum: 'sha256:3c9909afb221d1887e35e7592476b7e3666b6b7a85e82b3d712f558197779bc5', created: '2026-09-25 09:15 UTC' },
  ]);

  const [newObjectKey, setNewObjectKey] = useState('');
  const [newObjectSize, setNewObjectSize] = useState('256 MB');
  const [newObjectBucket, setNewObjectBucket] = useState('vault-production-bucket');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const triggerAuctionSimulation = () => {
    const suffixes = ['XA', 'TK', 'FR', 'TY', 'VA', 'OR'];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const shardId = `#${Math.floor(8950 + Math.random() * 100)}-${suffix}`;
    const winners = ['US-East-04', 'Oregon-12', 'Frankfurt-08', 'Tokyo-03', 'Ashburn-02', 'Dublin-09'];
    const winner = winners[Math.floor(Math.random() * winners.length)];
    const price = `$0.000${Math.floor(30 + Math.random() * 30)}`;
    const sizes = ['64 MB', '128 MB', '256 MB', '512 MB'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const latency = `${(0.75 + Math.random() * 0.5).toFixed(2)}ms`;

    const newItem = { id: shardId, shard: `Shard ${shardId}`, winner, price, size, latency, status: 'Verified' };
    setAuctionsList([newItem, ...auctionsList.slice(0, 5)]);
    showToast(`New reverse auction finalized for ${shardId}! Winner: ${winner} at ${price}`);
  };

  const handleUploadObject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectKey) return;
    const newItem = {
      key: newObjectKey.startsWith('/') ? newObjectKey.slice(1) : newObjectKey,
      bucket: newObjectBucket,
      size: newObjectSize,
      chunks: Math.max(1, Math.floor(parseInt(newObjectSize) / 8)),
      replicas: 3,
      checksum: `sha256:${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      created: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC'
    };
    setObjects([newItem, ...objects]);
    setNewObjectKey('');
    showToast(`Object successfully stored via Vickrey auction across 3 NVMe nodes!`);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md antialiased flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-4">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant/30 shadow-[0_1px_6px_rgba(28,25,23,0.03)]">
        <div className="h-16 max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shadow-sm">
                <Layers className="text-on-primary-container w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-lg text-on-surface tracking-tight">Vault</span>
                <span className="px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] tracking-wide font-bold uppercase">Auction</span>
              </div>
            </div>
            
            <nav className="hidden xl:flex items-center gap-1">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'cluster-health', label: 'Cluster Health' },
                { id: 'storage-auctions', label: 'Storage Auctions' },
                { id: 'benchmarks', label: 'Benchmarks' },
                { id: 'documentation', label: 'Documentation' },
                { id: 's3-storage', label: 'S3 Storage Console' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 transition-all text-sm rounded-lg font-medium ${
                    activeTab === tab.id 
                      ? 'bg-surface-container-low text-on-surface font-semibold shadow-xs' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span>&lt;8.2ms SLA (99.99%)</span>
            </div>
            <button 
              onClick={() => showToast('Test suite executed successfully: 1,024 concurrent PUTs verified across 16 edge clusters.')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-medium hover:bg-surface-container-low transition-colors shadow-sm border border-outline-variant/30"
              type="button"
            >
              Launch Test
            </button>
            <button 
              onClick={() => setModalType('deploy')}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary-fixed-dim transition-colors shadow-sm"
              type="button"
            >
              Deploy Node
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm cursor-pointer" onClick={() => showToast('Operator identity: admin@vault-auction.io (Raft Quorum Leader)')}>
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="xl:hidden p-2 rounded-lg hover:bg-surface-container-low"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-4 flex flex-col gap-2 shadow-xl animate-in fade-in">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'cluster-health', label: 'Cluster Health' },
              { id: 'storage-auctions', label: 'Storage Auctions' },
              { id: 'benchmarks', label: 'Benchmarks' },
              { id: 'documentation', label: 'Documentation' },
              { id: 's3-storage', label: 'S3 Storage Console' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-surface-container-low text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="w-full pt-20 bg-surface flex-grow pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col w-full gap-8 animate-in fade-in duration-300">
              {/* Top Welcome & System Status Bar */}
              <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="flex flex-col gap-2 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-xs w-fit shadow-sm border border-outline-variant/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
                    </span>
                    <span className="text-on-surface font-semibold">6 Global Regions In Consensus</span>
                    <span className="text-outline-variant">•</span>
                    <span className="text-primary font-medium">P99 Write: 10.4ms</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
                    Global Storage Fabric Overview
                  </h1>
                  <p className="text-base text-on-surface-variant leading-relaxed">
                    4,096 autonomous NVMe nodes coordinating real-time reverse sealed-bid placement auctions across sub-millisecond edge clusters.
                  </p>
                </div>

                {/* Quick Action Toolset */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button 
                    onClick={() => showToast('Health check complete: All 4,096 nodes operating within optimal tolerance. 0 checksum errors.')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-medium hover:bg-surface-container-low transition-all shadow-sm border border-outline-variant/30"
                    type="button"
                  >
                    <Activity className="w-4 h-4 text-tertiary" />
                    <span>Run Health Check</span>
                  </button>
                  <button 
                    onClick={() => showToast('SLA Audit Report generated and queued for download (PDF).')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-medium hover:bg-surface-container-low transition-all shadow-sm border border-outline-variant/30"
                    type="button"
                  >
                    <Download className="w-4 h-4 text-on-surface-variant" />
                    <span>Export SLA Report</span>
                  </button>
                  <button 
                    onClick={() => showToast('Live Stream telemetry connected via WebSocket to Raft consensus leader.')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm"
                    type="button"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Live Stream</span>
                  </button>
                </div>
              </section>

              {/* Key Metrics Row (4 Cards) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Managed Storage */}
                <div className="flex flex-col justify-between p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-outline-variant/20">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Total Managed Storage</span>
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center">
                        <HardDrive className="text-primary w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tracking-tight text-on-surface tabular-nums">48.6</span>
                      <span className="text-base text-on-surface-variant font-normal">PB</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-3 border-t border-outline-variant/10">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-on-surface-variant">Capacity Utilized</span>
                      <span className="font-semibold text-on-surface tabular-nums">91.2%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary-container rounded-full" style={{ width: '91.2%' }}></div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[11px] font-semibold tabular-nums">
                        +2.4 PB
                      </span>
                      <span className="text-xs text-on-surface-variant">provisioned this month</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Active Nodes */}
                <div className="flex flex-col justify-between p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-outline-variant/20">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Active Storage Nodes</span>
                      <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center">
                        <Server className="text-tertiary w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tracking-tight text-on-surface tabular-nums">4,096</span>
                      <span className="text-xs text-primary font-semibold">/ 4,096</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-3 border-t border-outline-variant/10 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                      <span className="text-xs text-on-surface font-medium">100% Online Fabric Health</span>
                    </div>
                    <span className="text-xs text-on-surface-variant">Spread over 16 verified facilities • 0 degraded</span>
                  </div>
                </div>

                {/* Card 3: Median Write Latency */}
                <div className="flex flex-col justify-between p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-outline-variant/20">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Median Write Latency</span>
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center">
                        <Zap className="text-primary w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tracking-tight text-on-surface tabular-nums">1.18</span>
                      <span className="text-base text-on-surface-variant font-normal">ms</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-9 w-full flex items-end">
                      <svg className="w-full h-8 text-primary-container" fill="none" preserveAspectRatio="none" viewBox="0 0 120 32">
                        <path d="M0,24 Q10,22 20,26 T40,16 T60,18 T80,8 T100,12 T120,4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                        <path d="M0,24 Q10,22 20,26 T40,16 T60,18 T80,8 T100,12 T120,4 L120,32 L0,32 Z" fill="currentColor" fillOpacity="0.12"></path>
                      </svg>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-on-surface-variant">
                      <span>Target SLA Ceiling</span>
                      <span className="font-semibold text-on-surface tabular-nums">25.0ms</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Monthly Ingress Savings */}
                <div className="flex flex-col justify-between p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-outline-variant/20">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Monthly Egress Savings</span>
                      <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center">
                        <DollarSign className="text-secondary w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tracking-tight text-on-surface tabular-nums">$184,200</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-3 border-t border-outline-variant/10 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
                        81.4% Saved
                      </span>
                      <span className="text-xs text-on-surface font-medium">vs Legacy Hyperscalers</span>
                    </div>
                    <span className="text-xs text-on-surface-variant">Dynamic transit arbitrage protocol active</span>
                  </div>
                </div>
              </section>

              {/* Core Dashboard Grid: Wide Left (8 cols), Narrow Right (4 cols) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column (8 cols): Regional Fabric & Tail Latency Analytics */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <span className="text-xs uppercase tracking-wide text-primary font-bold">Consensus Distribution</span>
                        <h2 className="text-xl font-semibold text-on-surface mt-0.5">Global Interconnect & Region Performance</h2>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
                        <button className="px-3 py-1 rounded bg-surface-container-lowest text-on-surface text-xs shadow-xs font-semibold" type="button">Real-Time</button>
                        <button className="px-3 py-1 rounded text-on-surface-variant hover:text-on-surface text-xs transition-colors font-medium" type="button">6H</button>
                        <button className="px-3 py-1 rounded text-on-surface-variant hover:text-on-surface text-xs transition-colors font-medium" type="button">24H</button>
                      </div>
                    </div>

                    {/* 4 Regional Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {[
                        { region: 'US-East', name: 'Virginia', rtt: '1.4ms', nodes: '1,280', bid: '$0.0012' },
                        { region: 'US-West', name: 'Oregon', rtt: '2.1ms', nodes: '1,024', bid: '$0.0011' },
                        { region: 'EU-Central', name: 'Frankfurt', rtt: '1.8ms', nodes: '960', bid: '$0.0014' },
                        { region: 'AP-East', name: 'Tokyo', rtt: '3.4ms', nodes: '832', bid: '$0.0015' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-surface-container-low flex flex-col justify-between gap-3 hover:bg-surface-container transition-colors border border-outline-variant/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                              <span className="font-semibold text-on-surface text-sm">{item.region}</span>
                              <span className="text-xs text-on-surface-variant">({item.name})</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold">Nominal</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <div>
                              <span className="text-[11px] text-on-surface-variant block">RTT Ping</span>
                              <span className="font-semibold text-on-surface text-sm tabular-nums">{item.rtt}</span>
                            </div>
                            <div>
                              <span className="text-[11px] text-on-surface-variant block">NVMe Nodes</span>
                              <span className="font-semibold text-on-surface text-sm tabular-nums">{item.nodes}</span>
                            </div>
                            <div>
                              <span className="text-[11px] text-on-surface-variant block">Floor Bid</span>
                              <span className="font-semibold text-primary text-sm tabular-nums">{item.bid}<span className="font-normal text-[10px]">/MB</span></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comparative Latency Trajectory Chart */}
                    <div className="p-4 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-semibold text-on-surface text-sm">Tail Write Latency: 24h Stabilization</h3>
                          <p className="text-xs text-on-surface-variant">Vault-Auction consensus convergence vs Legacy Centralized Cloud</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-1 bg-primary-container rounded"></span>
                            <span className="text-xs text-on-surface font-medium">Vault-Auction (10.4ms)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-1 bg-outline-variant rounded"></span>
                            <span className="text-xs text-on-surface-variant">Legacy Cloud (140ms)</span>
                          </div>
                        </div>
                      </div>

                      {/* Clean Vector Trajectory Visualization */}
                      <div className="relative w-full h-44 pt-2">
                        <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 700 140">
                          <line className="text-surface-container-high" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="700" y1="20" y2="20"></line>
                          <line className="text-surface-container-high" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="700" y1="60" y2="60"></line>
                          <line className="text-surface-container-high" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="700" y1="100" y2="100"></line>
                          
                          <path className="text-outline-variant" d="M0,25 C70,30 120,15 190,32 C260,42 320,18 390,28 C460,35 520,15 580,24 C640,30 680,22 700,28" fill="none" stroke="currentColor" strokeDasharray="5 5" strokeWidth="2"></path>
                          <path className="text-primary-container" d="M0,118 C60,116 120,120 180,117 C240,115 300,119 360,117 C420,116 480,118 540,116 C600,117 650,115 700,116" fill="none" stroke="currentColor" strokeWidth="3"></path>
                          <path className="text-primary-container" d="M0,118 C60,116 120,120 180,117 C240,115 300,119 360,117 C420,116 480,118 540,116 C600,117 650,115 700,116 L700,140 L0,140 Z" fill="currentColor" fillOpacity="0.08"></path>
                          
                          <circle className="fill-primary-container" cx="680" cy="116" r="4.5"></circle>
                          <circle className="stroke-primary-container" cx="680" cy="116" fill="none" opacity="0.4" r="8"></circle>
                        </svg>
                        <div className="flex justify-between items-center text-xs text-on-surface-variant pt-2">
                          <span>24h ago</span>
                          <span>18h ago</span>
                          <span>12h ago</span>
                          <span>6h ago</span>
                          <span className="text-primary font-semibold">Live</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (4 cols): Real-Time Storage Auctions Feed */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm flex flex-col h-full border border-outline-variant/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-secondary-fixed flex items-center justify-center">
                          <Gavel className="text-secondary w-4 h-4" />
                        </div>
                        <h2 className="font-semibold text-on-surface text-base">Real-Time Auctions</h2>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
                        Active Block
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                      Live feed of finalized second-price chunk auctions executed across NVMe candidate pools.
                    </p>

                    {/* Auctions List */}
                    <div className="flex flex-col gap-3 flex-grow">
                      {auctionsList.map((item, idx) => (
                        <div key={idx} className="p-3.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-1.5 border border-outline-variant/10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-on-surface">{item.shard}</span>
                            <span className="inline-flex items-center gap-1 text-primary text-xs font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{item.status}</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-xs text-on-surface-variant">Winner: <span className="text-on-surface font-medium">{item.winner}</span></span>
                            <span className="font-semibold text-on-surface tabular-nums text-base">{item.price}<span className="font-normal text-xs text-on-surface-variant">/MB</span></span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/10">
                            <span>Size: {item.size}</span>
                            <span>Latency: {item.latency}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setActiveTab('storage-auctions')}
                      className="w-full mt-4 py-2.5 px-3 rounded-lg bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 border border-outline-variant/20"
                      type="button"
                    >
                      <span>Inspect Mempool Auctions</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Node Deployment CTA Banner (Soft Emerald Tinted) */}
              <section className="p-8 md:p-10 rounded-xl bg-surface-container-low relative overflow-hidden shadow-sm border border-outline-variant/20">
                <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-primary-fixed opacity-60 blur-3xl pointer-events-none"></div>
                <div className="absolute left-1/3 -top-24 w-72 h-72 rounded-full bg-secondary-fixed opacity-40 blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 max-w-2xl">
                    <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-sm">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-primary text-xs font-semibold w-fit border border-outline-variant/20">
                        <span>Proof of Spacetime v2</span>
                      </div>
                      <h2 className="text-2xl font-bold text-on-surface tracking-tight">Deploy New NVMe Storage Nodes in Seconds</h2>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        Connect bare-metal or enterprise cloud storage disks to the global auction fabric. Earn algorithmic yield on idle bandwidth and verifiable storage capacity.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button 
                      onClick={() => setActiveTab('documentation')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold hover:bg-surface-container transition-all shadow-sm border border-outline-variant/30"
                      type="button"
                    >
                      <FileText className="w-4 h-4 text-tertiary" />
                      <span>Browse API Docs</span>
                    </button>
                    <button 
                      onClick={() => setModalType('deploy')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary-fixed-dim transition-all shadow-md"
                      type="button"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Docker Daemon</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: CLUSTER HEALTH */}
          {activeTab === 'cluster-health' && (
            <div className="flex flex-col w-full gap-8 animate-in fade-in duration-300">
              <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-primary font-bold mb-1">Epoch 8,421 • Consensus Active</div>
                  <h1 className="text-3xl font-bold text-on-surface tracking-tight">Cluster Health & Node Fleet</h1>
                  <p className="text-sm text-on-surface-variant mt-1">
                    4,096 verified NVMe storage daemons providing autonomous zero-knowledge sharding, distributed erasure-coding, and cryptographic quorum attestation across four global availability zones.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => showToast('Theme palette locked: Luminous Modern')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-medium border border-outline-variant/30 hover:bg-surface-container-low shadow-sm">
                    <RefreshCw className="w-3.5 h-3.5 text-primary" />
                    <span>Theme Palette</span>
                  </button>
                  <button onClick={() => showToast('Full node topology exported to JSON.')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-medium border border-outline-variant/30 hover:bg-surface-container-low shadow-sm">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Topology</span>
                  </button>
                  <button onClick={() => showToast('Fleet diagnostic probe initiated across 16 datacenters.')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-medium border border-outline-variant/30 hover:bg-surface-container-low shadow-sm">
                    <Activity className="w-3.5 h-3.5 text-tertiary" />
                    <span>Run Fleet Diagnosis</span>
                  </button>
                  <button onClick={() => setModalType('deploy')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold shadow-sm hover:bg-primary-fixed-dim">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Node</span>
                  </button>
                </div>
              </section>

              {/* Top 4 Fleet Metric Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Online Nodes</span>
                    <Server className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-on-surface">4,096 / 4,096</div>
                    <div className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> 100% Operational Quorum
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Storage Fabric</span>
                    <HardDrive className="w-4 h-4 text-tertiary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-on-surface">48.6 PB <span className="text-xs text-on-surface-variant font-normal">91.1% Allocated</span></div>
                    <div className="text-xs text-on-surface-variant mt-1">Used: 44.3 PB • Free: 4.3 PB</div>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Wear Endurance</span>
                    <Shield className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-on-surface">0.994 Nominal</div>
                    <div className="text-xs text-on-surface-variant mt-1">SMART media endurance aggregate</div>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Mesh Throughput</span>
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-on-surface">3.20 Tbps <span className="text-xs text-primary">&lt;0.4ms Jitter</span></div>
                    <div className="text-xs text-on-surface-variant mt-1">Full duplex non-blocking spine</div>
                  </div>
                </div>
              </section>

              {/* Regional Availability Zones */}
              <section className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-on-surface">Regional Availability Zones</h2>
                    <p className="text-xs text-on-surface-variant">Direct fiber-cross-connected colocation vaults with isolated power buses.</p>
                  </div>
                  <span className="text-xs font-semibold text-primary">4 Active Regions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { dc: 'DC-01 • PRIMARY HUB', name: 'US-East (Ashburn, Virginia)', nodes: '1,536', cap: '18.2 PB', ping: '1.4 ms', load: '94.2%', uptime: '99.999%' },
                    { dc: 'DC-02 • HYDRO-VAULT', name: 'US-West (The Dalles, Oregon)', nodes: '1,024', cap: '12.1 PB', ping: '2.1 ms', load: '88.7%', uptime: '99.999%' },
                    { dc: 'DC-03 • SOVEREIGN CORE', name: 'EU-Central (Frankfurt, Germany)', nodes: '960', cap: '11.4 PB', ping: '1.8 ms', load: '89.4%', uptime: '99.999%' },
                    { dc: 'DC-04 • ASIA SPINE', name: 'AP-East (Tokyo, Japan)', nodes: '832', cap: '6.9 PB', ping: '3.4 ms', load: '91.8%', uptime: '99.999%' },
                  ].map((zone, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-surface-container-low flex flex-col justify-between gap-4 border border-outline-variant/10 hover:bg-surface-container transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold tracking-wide text-primary block">{zone.dc}</span>
                          <span className="text-xs font-semibold text-on-surface mt-0.5 block">{zone.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-primary">{zone.uptime}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-outline-variant/10">
                        <div>
                          <span className="text-on-surface-variant block text-[10px]">Nodes</span>
                          <span className="font-semibold text-on-surface">{zone.nodes}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant block text-[10px]">Capacity</span>
                          <span className="font-semibold text-on-surface">{zone.cap}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant block text-[10px]">Avg Ping</span>
                          <span className="font-semibold text-on-surface">{zone.ping}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant block text-[10px]">Fabric Load</span>
                          <span className="font-semibold text-on-surface">{zone.load}</span>
                        </div>
                      </div>
                      <button onClick={() => showToast(`Opening rack topology explorer for ${zone.name}`)} className="w-full py-1.5 px-3 rounded bg-surface-container-lowest text-on-surface text-xs font-medium hover:bg-surface-container transition-colors flex items-center justify-between border border-outline-variant/20">
                        <span>View Racks</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Node Fleet Directory Table */}
              <section className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-on-surface">Node Fleet Directory</h2>
                    <p className="text-xs text-on-surface-variant">Individual machine metrics, NVMe controller health, and shard allocations.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                      <input 
                        type="text" 
                        placeholder="Filter by node ID..." 
                        className="pl-9 pr-4 py-1.5 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <select className="px-3 py-1.5 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 text-on-surface">
                      <option>All Statuses</option>
                      <option>Active Quorum</option>
                      <option>Draining</option>
                    </select>
                    <select className="px-3 py-1.5 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 text-on-surface">
                      <option>All Regions</option>
                      <option>US-East</option>
                      <option>US-West</option>
                      <option>EU-Central</option>
                      <option>AP-East</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Node Identifier</th>
                        <th className="py-3 px-4 font-semibold">Location / Rack</th>
                        <th className="py-3 px-4 font-semibold">Hardware Controller</th>
                        <th className="py-3 px-4 font-semibold">IOPS Queue</th>
                        <th className="py-3 px-4 font-semibold">Smart Health</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {nodes.map((n, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-on-surface">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="font-mono">{n.id}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-on-surface-variant">{n.rack}</td>
                          <td className="py-3.5 px-4 text-on-surface font-mono text-[11px]">{n.controller}</td>
                          <td className="py-3.5 px-4 font-mono text-on-surface">{n.iops}</td>
                          <td className="py-3.5 px-4 text-on-surface-variant">{n.health}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              n.status.includes('Active') ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'
                            }`}>
                              {n.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button onClick={() => showToast(`Running SMART diagnostic probe on ${n.id}`)} className="px-2.5 py-1 rounded bg-surface-container text-on-surface text-[11px] hover:bg-surface-container-high transition-colors font-medium">SMART</button>
                            <button onClick={() => showToast(`Initiating graceful drain sequence for ${n.id}`)} className="px-2.5 py-1 rounded bg-error-container text-on-error-container text-[11px] hover:opacity-95 transition-opacity font-medium">Drain</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant/10 text-xs text-on-surface-variant">
                  <span>Showing 4 of 4,096 nodes</span>
                  <div className="flex items-center gap-2">
                    <span className="cursor-pointer hover:text-on-surface">Previous</span>
                    <span className="font-semibold text-primary">Next</span>
                  </div>
                </div>
              </section>

              {/* Install snippet box */}
              <section className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">Instantly Attach a Bare-Metal Daemon</h3>
                    <p className="text-xs text-on-surface-variant">Requires minimum Dual 10GbE SFP+ uplinks, 32GB ECC RAM, and Direct PCIe NVMe block devices. Run our attestation script to join the decentralized consensus epoch.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/30 font-mono text-xs overflow-x-auto">
                  <span className="text-primary">curl -sSL https://get.vault.io/daemon | bash -s --role=storage</span>
                  <button onClick={() => showToast('Installation command copied to clipboard!')} className="p-1 rounded hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: STORAGE AUCTIONS & SIMULATOR */}
          {activeTab === 'storage-auctions' && (
            <div className="flex flex-col w-full gap-8 animate-in fade-in duration-300">
              <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-secondary font-bold mb-1">Mempool & Vickrey Auction Engine</div>
                  <h1 className="text-3xl font-bold text-on-surface tracking-tight">Real-Time Storage Auctions</h1>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Every data chunk PUT is auctioned dynamically among 4,096 NVMe nodes. Nodes bid based on live CPU load, free space, and IOPS queue depth.
                  </p>
                </div>
                <button 
                  onClick={triggerAuctionSimulation}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary-container text-on-secondary-container text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Simulate New Chunk Auction</span>
                </button>
              </section>

              {/* Interactive Auction Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Average Winning Bid</span>
                  <div className="text-2xl font-bold text-on-surface mt-2">$0.00041 <span className="text-xs text-primary font-normal">/MB per epoch</span></div>
                  <p className="text-xs text-on-surface-variant mt-1">Second-price VCG Vickrey clearing active</p>
                </div>
                <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Auction Throughput</span>
                  <div className="text-2xl font-bold text-on-surface mt-2">14,280 <span className="text-xs text-primary font-normal">auctions / sec</span></div>
                  <p className="text-xs text-on-surface-variant mt-1">Sub-millisecond node telemetry polling</p>
                </div>
                <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Sybil Resistance</span>
                  <div className="text-2xl font-bold text-on-surface mt-2">100% Verified</div>
                  <p className="text-xs text-on-surface-variant mt-1">Hardware token attestation enforced</p>
                </div>
              </div>

              {/* Active Auction Ledger Table */}
              <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm">
                <h2 className="text-lg font-semibold text-on-surface mb-4">Live Auction Mempool Stream</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Shard ID</th>
                        <th className="py-3 px-4 font-semibold">Winning Node</th>
                        <th className="py-3 px-4 font-semibold">Clearing Price</th>
                        <th className="py-3 px-4 font-semibold">Chunk Size</th>
                        <th className="py-3 px-4 font-semibold">RTT Latency</th>
                        <th className="py-3 px-4 font-semibold">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {auctionsList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low/40">
                          <td className="py-3.5 px-4 font-mono font-medium text-on-surface">{item.shard}</td>
                          <td className="py-3.5 px-4 font-semibold text-on-surface">{item.winner}</td>
                          <td className="py-3.5 px-4 font-mono text-primary font-bold">{item.price}/MB</td>
                          <td className="py-3.5 px-4 text-on-surface-variant">{item.size}</td>
                          <td className="py-3.5 px-4 font-mono text-on-surface">{item.latency}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-primary font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BENCHMARKS */}
          {activeTab === 'benchmarks' && (
            <div className="flex flex-col w-full gap-8 animate-in fade-in duration-300">
              <div>
                <div className="text-xs uppercase tracking-wider text-primary font-bold mb-1">Comparative Analysis & Gap Matrix</div>
                <h1 className="text-3xl font-bold text-on-surface tracking-tight">Vault-Auction vs Legacy Systems</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  Comprehensive benchmark breakdown against Ceph, HDFS, OpenStack Swift, and MinIO.
                </p>
              </div>

              {/* Benchmark Comparison Table */}
              <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Feature / System</th>
                      <th className="py-3 px-4 font-semibold">Ceph</th>
                      <th className="py-3 px-4 font-semibold">HDFS</th>
                      <th className="py-3 px-4 font-semibold">Swift</th>
                      <th className="py-3 px-4 font-semibold">MinIO</th>
                      <th className="py-3 px-4 font-semibold text-primary">Vault-Auction (Ours)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-on-surface">Data Placement</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">CRUSH map (hierarchical buckets)</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">NameNode random block placement</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Ring hashing partition→device</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Erasure shards across nodes</td>
                      <td className="py-3.5 px-4 font-semibold text-primary bg-primary-fixed/20">Auction-based placement using telemetry bids</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-on-surface">Fault Domains</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Racks / hosts via CRUSH map</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Single NameNode (+DataNodes)</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Configurable zones</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Device class (SSD/HDD)</td>
                      <td className="py-3.5 px-4 font-semibold text-primary bg-primary-fixed/20">Enforces rack/host failure domain rules via bid filters</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-on-surface">Metadata</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Distributed MON cluster (Paxos)</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Single master NameNode (SPOF)</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Decentralized proxy+ring</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">External KV (etcd)</td>
                      <td className="py-3.5 px-4 font-semibold text-primary bg-primary-fixed/20">Raft cluster (no SPOF; strong consistency)</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-on-surface">Tail Latency</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Not specifically addressed</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Batch-oriented</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Not addressed explicitly</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">Not addressed explicitly</td>
                      <td className="py-3.5 px-4 font-semibold text-primary bg-primary-fixed/20">Targeted (auctions avoid slow straggler nodes)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTATION & RESEARCH PAPER */}
          {activeTab === 'documentation' && (
            <div className="flex flex-col w-full gap-8 animate-in fade-in duration-300">
              <div>
                <div className="text-xs uppercase tracking-wider text-primary font-bold mb-1">Interactive Research Paper & SRS</div>
                <h1 className="text-3xl font-bold text-on-surface tracking-tight">Vault-Auction Architecture Specification</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  Complete technical specification covering system modules, data flows, failure modes, mechanism design, and sprint roadmap.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-primary font-bold">PDF SPECIFICATION</span>
                    <h3 className="text-base font-semibold text-on-surface mt-1">VaultAuction_ResearchPaper.pdf</h3>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">Comparative analysis with Ceph, HDFS, Swift, MinIO, formal auction theory background, and Vickrey mechanism design.</p>
                  </div>
                  <button onClick={() => showToast('Downloading VaultAuction_ResearchPaper.pdf')} className="mt-6 py-2 px-3 rounded bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
                <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-primary font-bold">PDF SPECIFICATION</span>
                    <h3 className="text-base font-semibold text-on-surface mt-1">VaultAuction_ArchitectureDesign.pdf</h3>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">System overview, API Gateway, Auction Engine, Raft metadata store, PUT/GET data flow sequence diagrams.</p>
                  </div>
                  <button onClick={() => showToast('Downloading VaultAuction_ArchitectureDesign.pdf')} className="mt-6 py-2 px-3 rounded bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
                <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-primary font-bold">PDF SPECIFICATION</span>
                    <h3 className="text-base font-semibold text-on-surface mt-1">VaultAuction_SRS.pdf</h3>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">IEEE-style functional and non-functional requirements, fault tolerance guarantees, and security hardening rules.</p>
                  </div>
                  <button onClick={() => showToast('Downloading VaultAuction_SRS.pdf')} className="mt-6 py-2 px-3 rounded bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>

              <div className="p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm">
                <h2 className="text-xl font-semibold text-on-surface mb-4">Executive Summary & Core Modules</h2>
                <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                  <p>
                    Vault-Auction is a reverse-auction-based distributed object store that adapts data placement and repair to real-time node conditions. Unlike fixed placement schemes, Vault-Auction continuously collects node telemetry (IOPS, latency, health) and runs auctions to assign chunks to the cheapest qualified nodes subject to safety constraints.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10">
                      <h4 className="font-semibold text-on-surface mb-1">API Gateway & Auth Service</h4>
                      <p className="text-xs">Handles client requests (S3-style PUT/GET/DELETE), implements authentication (AWS SIGv4, JWT tokens), and splits large objects into fixed-size chunks.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10">
                      <h4 className="font-semibold text-on-surface mb-1">Auction Engine</h4>
                      <p className="text-xs">Collects bids based on telemetry cost models, executes Vickrey second-price auctions, and enforces rack/host diversity constraints.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10">
                      <h4 className="font-semibold text-on-surface mb-1">Raft Metadata Consensus</h4>
                      <p className="text-xs">A 3-5 node Raft cluster storing object directory, chunk-to-node mappings, and cluster configuration with strong linearizable consistency.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/10">
                      <h4 className="font-semibold text-on-surface mb-1">Repair Engine (Self-Healing)</h4>
                      <p className="text-xs">Monitors under-replicated chunks after node failures and schedules background auctions to re-replicate data on the least-loaded nodes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: S3-COMPATIBLE OBJECT STORAGE CONSOLE */}
          {activeTab === 's3-storage' && (
            <div className="flex flex-col w-full gap-8 animate-in fade-in duration-300">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-primary font-bold mb-1">S3-Compatible API Gateway</div>
                  <h1 className="text-3xl font-bold text-on-surface tracking-tight">Object Storage Console</h1>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Upload objects, inspect SHA-256 chunk mappings across replicated NVMe nodes, and stream GET requests.
                  </p>
                </div>
              </div>

              {/* Upload Object Form */}
              <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm">
                <h2 className="text-lg font-semibold text-on-surface mb-4">Upload Object (PUT Request Simulator)</h2>
                <form onSubmit={handleUploadObject} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Bucket Name</label>
                    <select 
                      value={newObjectBucket} 
                      onChange={(e) => setNewObjectBucket(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 text-on-surface"
                    >
                      <option value="vault-production-bucket">vault-production-bucket</option>
                      <option value="vault-ml-bucket">vault-ml-bucket</option>
                      <option value="vault-ai-models">vault-ai-models</option>
                      <option value="vault-telemetry">vault-telemetry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Object Key / Path</label>
                    <input 
                      type="text" 
                      placeholder="e.g. data/shard-stream.bin"
                      value={newObjectKey}
                      onChange={(e) => setNewObjectKey(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Payload Size</label>
                    <select 
                      value={newObjectSize}
                      onChange={(e) => setNewObjectSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 text-on-surface"
                    >
                      <option value="64 MB">64 MB (8 chunks)</option>
                      <option value="128 MB">128 MB (16 chunks)</option>
                      <option value="256 MB">256 MB (32 chunks)</option>
                      <option value="1 GB">1 GB (128 chunks)</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2 px-4 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary-fixed-dim transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Store via Auction</span>
                  </button>
                </form>
              </div>

              {/* Stored Objects Table */}
              <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm">
                <h2 className="text-lg font-semibold text-on-surface mb-4">Object Directory & Raft Mappings</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Object Key</th>
                        <th className="py-3 px-4 font-semibold">Bucket</th>
                        <th className="py-3 px-4 font-semibold">Size</th>
                        <th className="py-3 px-4 font-semibold">Chunks</th>
                        <th className="py-3 px-4 font-semibold">Replicas</th>
                        <th className="py-3 px-4 font-semibold">SHA-256 Checksum</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {objects.map((obj, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low/50">
                          <td className="py-3.5 px-4 font-semibold text-on-surface flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{obj.key}</span>
                          </td>
                          <td className="py-3.5 px-4 text-on-surface-variant">{obj.bucket}</td>
                          <td className="py-3.5 px-4 font-mono text-on-surface">{obj.size}</td>
                          <td className="py-3.5 px-4 font-mono text-on-surface">{obj.chunks}</td>
                          <td className="py-3.5 px-4 font-mono text-on-surface">RF={obj.replicas}</td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-on-surface-variant truncate max-w-[200px]">{obj.checksum}</td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button onClick={() => showToast(`Streaming GET request for ${obj.key} from replica node 1... Success (200 OK)`)} className="px-2.5 py-1 rounded bg-surface-container text-on-surface text-[11px] hover:bg-surface-container-high transition-colors font-medium">GET</button>
                            <button onClick={() => { setObjects(objects.filter((_, i) => i !== idx)); showToast(`Object ${obj.key} deleted and replicas freed.`); }} className="px-2.5 py-1 rounded bg-error-container text-on-error-container text-[11px] hover:opacity-95 transition-opacity font-medium">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Deploy Modal */}
      {modalType === 'deploy' && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest max-w-lg w-full p-6 rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-on-surface">Deploy NVMe Storage Node</h3>
              </div>
              <button onClick={() => setModalType(null)} className="p-1 rounded-lg hover:bg-surface-container-low">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Run the following bootstrap command on your bare-metal server or Kubernetes cluster to register your NVMe pool with the Vault-Auction consensus mesh.
            </p>
            <div className="bg-surface-container-low p-3 rounded-xl font-mono text-xs text-primary overflow-x-auto border border-outline-variant/20">
              curl -sSL https://get.vault.io/daemon | bash -s --role=storage --capacity=30.72TB
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-high">
                Cancel
              </button>
              <button onClick={() => { setModalType(null); showToast('Node attestation request submitted to Raft leader.'); }} className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary-fixed-dim">
                Copy Command & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-8">
            <div className="md:col-span-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary-container flex items-center justify-center">
                  <Layers className="text-on-primary-container w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-title text-on-surface">Vault-Auction</span>
              </div>
              <p className="text-xs text-on-surface-variant max-w-md leading-relaxed">
                Next-Generation Autonomous Distributed Cloud Storage Protocol. High throughput, verifiable zero-knowledge sharding, and real-time algorithmic bandwidth auctions.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-[11px] font-semibold">SOC2 Type II</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-[11px] font-semibold">ISO/IEC 27001</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-[11px] font-semibold">FIPS 140-3</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[11px] font-semibold">Mainnet v3.8.4</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Network</span>
              <button onClick={() => setActiveTab('cluster-health')} className="text-left text-xs text-on-surface hover:text-primary transition-colors">Consensus Engine</button>
              <button onClick={() => setActiveTab('cluster-health')} className="text-left text-xs text-on-surface hover:text-primary transition-colors">Shard Topology</button>
              <button onClick={() => setActiveTab('cluster-health')} className="text-left text-xs text-on-surface hover:text-primary transition-colors">Node Operators</button>
              <button onClick={() => setActiveTab('storage-auctions')} className="text-left text-xs text-on-surface hover:text-primary transition-colors">Auction Ledger</button>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Governance</span>
              <button onClick={() => setActiveTab('documentation')} className="text-left text-xs text-on-surface hover:text-primary transition-colors">Security Audits</button>
              <button onClick={() => setActiveTab('overview')} className="text-left text-xs text-on-surface hover:text-primary transition-colors">SLA Guarantee</button>
              <button onClick={() => setActiveTab('documentation')} className="text-left text-xs text-on-surface hover:text-primary transition-colors">Bug Bounty</button>
              <button onClick={() => setActiveTab('cluster-health')} className="text-left text-xs text-on-surface hover:text-primary transition-colors">Status Portal</button>
            </div>
          </div>
          <div className="pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
            <span>© 2025 Vault-Auction Infrastructure. Distributed Storage Architecture.</span>
            <div className="flex items-center gap-4">
              <span className="text-primary font-semibold">Global Consensus Active</span>
              <span>•</span>
              <span>All Nodes Synchronized</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
