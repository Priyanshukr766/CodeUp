2026-06-09T16:07:53.316067398Z #8 20.49 
2026-06-09T16:07:54.20376354Z #8 20.52 Reading package lists...
2026-06-09T16:07:54.472526373Z #8 21.58 Building dependency tree...
2026-06-09T16:07:54.62315905Z #8 21.83 Reading state information...
2026-06-09T16:07:54.718369621Z #8 22.08 The following NEW packages will be installed:
2026-06-09T16:07:54.955176842Z #8 22.08   nodejs
2026-06-09T16:07:54.955202982Z #8 22.16 0 upgraded, 1 newly installed, 0 to remove and 128 not upgraded.
2026-06-09T16:07:54.955208532Z #8 22.16 Need to get 32.2 MB of archives.
2026-06-09T16:07:54.955212522Z #8 22.16 After this operation, 196 MB of additional disk space will be used.
2026-06-09T16:07:54.955217012Z #8 22.16 Get:1 https://deb.nodesource.com/node_20.x nodistro/main amd64 nodejs amd64 20.20.2-1nodesource1 [32.2 MB]
2026-06-09T16:07:55.853625217Z #8 23.21 debconf: delaying package configuration, since apt-utils is not installed
2026-06-09T16:07:55.955068056Z #8 23.31 Fetched 32.2 MB in 1s (32.7 MB/s)
2026-06-09T16:07:56.38192449Z #8 23.74 Selecting previously unselected package nodejs.
2026-06-09T16:07:56.582837789Z #8 23.74 (Reading database ... 
(Reading database ... 5%
(Reading database ... 10%
(Reading database ... 15%
(Reading database ... 20%
(Reading database ... 25%
(Reading database ... 30%
(Reading database ... 35%
(Reading database ... 40%
(Reading database ... 45%
(Reading database ... 50%
(Reading database ... 55%
(Reading database ... 60%
(Reading database ... 65%
(Reading database ... 70%
(Reading database ... 75%
(Reading database ... 80%
(Reading database ... 85%
(Reading database ... 90%
(Reading database ... 95%
(Reading database ... 100%
(Reading database ... 29184 files and directories currently installed.)
2026-06-09T16:07:56.582858189Z #8 23.76 Preparing to unpack .../nodejs_20.20.2-1nodesource1_amd64.deb ...
2026-06-09T16:07:56.582863149Z #8 23.79 Unpacking nodejs (20.20.2-1nodesource1) ...
2026-06-09T16:07:59.827399959Z #8 27.18 Setting up nodejs (20.20.2-1nodesource1) ...
2026-06-09T16:08:00.513626931Z #8 DONE 27.9s
2026-06-09T16:08:00.630648903Z 
2026-06-09T16:08:00.630678194Z #9 [4/9] COPY requirements.txt .
2026-06-09T16:08:00.630685324Z #9 DONE 0.1s
2026-06-09T16:08:00.785425967Z 
2026-06-09T16:08:00.785451257Z #10 [5/9] RUN pip install --no-cache-dir -r requirements.txt
2026-06-09T16:08:01.32674253Z #10 0.694 Collecting greenlet==3.5.1 (from -r requirements.txt (line 1))
2026-06-09T16:08:01.442006285Z #10 0.761   Downloading greenlet-3.5.1-cp310-cp310-manylinux_2_24_x86_64.manylinux_2_28_x86_64.whl.metadata (3.8 kB)
2026-06-09T16:08:01.442024906Z #10 0.809 Collecting playwright==1.60.0 (from -r requirements.txt (line 2))
2026-06-09T16:08:01.581599224Z #10 0.821   Downloading playwright-1.60.0-py3-none-manylinux1_x86_64.whl.metadata (3.5 kB)
2026-06-09T16:08:01.581622235Z #10 0.841 Collecting pyee==13.0.1 (from -r requirements.txt (line 3))
2026-06-09T16:08:01.581625715Z #10 0.855   Downloading pyee-13.0.1-py3-none-any.whl.metadata (3.0 kB)
2026-06-09T16:08:01.581628515Z #10 0.886 Collecting typing_extensions==4.15.0 (from -r requirements.txt (line 4))
2026-06-09T16:08:01.581631545Z #10 0.898   Downloading typing_extensions-4.15.0-py3-none-any.whl.metadata (3.3 kB)
2026-06-09T16:08:01.581635365Z #10 0.949 Downloading greenlet-3.5.1-cp310-cp310-manylinux_2_24_x86_64.manylinux_2_28_x86_64.whl (612 kB)
2026-06-09T16:08:01.789698791Z #10 0.992    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 612.9/612.9 kB 15.4 MB/s eta 0:00:00
2026-06-09T16:08:01.789723682Z #10 1.006 Downloading playwright-1.60.0-py3-none-manylinux1_x86_64.whl (47.5 MB)
2026-06-09T16:08:02.064779074Z #10 1.251    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 47.5/47.5 MB 219.6 MB/s eta 0:00:00
2026-06-09T16:08:02.064801265Z #10 1.264 Downloading pyee-13.0.1-py3-none-any.whl (15 kB)
2026-06-09T16:08:02.064805175Z #10 1.277 Downloading typing_extensions-4.15.0-py3-none-any.whl (44 kB)
2026-06-09T16:08:02.064808335Z #10 1.281    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 44.6/44.6 kB 180.3 MB/s eta 0:00:00
2026-06-09T16:08:02.108297295Z #10 1.475 Installing collected packages: typing_extensions, greenlet, pyee, playwright
2026-06-09T16:08:03.656158549Z #10 3.023 Successfully installed greenlet-3.5.1 playwright-1.60.0 pyee-13.0.1 typing_extensions-4.15.0
2026-06-09T16:08:03.894609444Z #10 3.024 WARNING: Running pip as the 'root' user can result in broken permissions and conflicting behaviour with the system package manager. It is recommended to use a virtual environment instead: https://pip.pypa.io/warnings/venv
2026-06-09T16:08:03.894626595Z #10 3.111 
2026-06-09T16:08:03.894630745Z #10 3.111 [notice] A new release of pip is available: 24.0 -> 26.1.2
2026-06-09T16:08:03.894634035Z #10 3.111 [notice] To update, run: python -m pip install --upgrade pip
2026-06-09T16:08:06.129663691Z #10 DONE 5.5s
2026-06-09T16:08:06.246406887Z 
2026-06-09T16:08:06.246429708Z #11 [6/9] COPY server/package*.json ./server/
2026-06-09T16:08:06.246435838Z #11 DONE 0.1s
2026-06-09T16:08:06.399298661Z 
2026-06-09T16:08:06.399341352Z #12 [7/9] RUN cd server && npm install --production
2026-06-09T16:08:06.423162355Z #12 0.174 npm warn config production Use `--omit=dev` instead.
2026-06-09T16:08:07.966964896Z #12 1.716 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
2026-06-09T16:08:08.629509947Z #12 2.380 
2026-06-09T16:08:08.629529738Z #12 2.380 added 139 packages, and audited 140 packages in 2s
2026-06-09T16:08:08.629533818Z #12 2.381 
2026-06-09T16:08:08.629538098Z #12 2.381 25 packages are looking for funding
2026-06-09T16:08:08.782239038Z #12 2.381   run `npm fund` for details
2026-06-09T16:08:08.782259259Z #12 2.382 
2026-06-09T16:08:08.782263019Z #12 2.382 found 0 vulnerabilities
2026-06-09T16:08:08.782268949Z #12 2.383 npm notice
2026-06-09T16:08:08.782284129Z #12 2.383 npm notice New major version of npm available! 10.8.2 -> 11.16.0
2026-06-09T16:08:08.782287389Z #12 2.383 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.16.0
2026-06-09T16:08:08.782291519Z #12 2.383 npm notice To update run: npm install -g npm@11.16.0
2026-06-09T16:08:08.782294409Z #12 2.383 npm notice
2026-06-09T16:08:11.76217619Z #12 DONE 5.5s
2026-06-09T16:08:11.874845912Z 
2026-06-09T16:08:11.874866312Z #13 [8/9] COPY server/ ./server/
2026-06-09T16:08:11.874870282Z #13 DONE 0.1s
2026-06-09T16:08:12.080486497Z 
2026-06-09T16:08:12.080512978Z #14 [9/9] COPY cf_fetcher.py .
2026-06-09T16:08:12.080518858Z #14 DONE 0.0s
2026-06-09T16:08:12.080523248Z 
2026-06-09T16:08:12.080528828Z #15 exporting to image
2026-06-09T16:08:12.080533768Z #15 exporting layers
2026-06-09T16:08:14.029398711Z #15 exporting layers 2.1s done
2026-06-09T16:08:14.242709996Z #15 exporting manifest sha256:1b2f5173ab983fad235284cfa5fe0c150bca5942775df0aaee8ce555e5d33ce1 0.0s done
2026-06-09T16:08:14.242726876Z #15 exporting config sha256:daadabd6eff59787d93670e2b4b33923c0bff9626cb65df6e50a6b4ec4ac72e8 0.0s done
2026-06-09T16:08:14.242732626Z #15 pushing layers
2026-06-09T16:08:19.295883993Z #15 ...
2026-06-09T16:08:19.295903743Z 
2026-06-09T16:08:19.295908363Z #16 exporting cache to registry
2026-06-09T16:08:19.295912523Z #16 sending cache export
2026-06-09T16:08:23.485728802Z #16 ...
2026-06-09T16:08:23.485748112Z 
2026-06-09T16:08:23.485752912Z #15 exporting to image
2026-06-09T16:08:23.485756842Z #15 pushing layers 9.4s done
2026-06-09T16:08:23.485760943Z #15 pushing manifest for image-registry-v2.aws-us-east-2-2.internal.render.com/srv-d8k3jureo5us73elh6c0:bld-d8k3jv3eo5us73elh6lg@sha256:1b2f5173ab983fad235284cfa5fe0c150bca5942775df0aaee8ce555e5d33ce1
2026-06-09T16:08:23.640480844Z #15 pushing manifest for image-registry-v2.aws-us-east-2-2.internal.render.com/srv-d8k3jureo5us73elh6c0:bld-d8k3jv3eo5us73elh6lg@sha256:1b2f5173ab983fad235284cfa5fe0c150bca5942775df0aaee8ce555e5d33ce1 0.2s done
2026-06-09T16:08:23.640498895Z #15 DONE 11.7s
2026-06-09T16:08:23.640505465Z 
2026-06-09T16:08:23.640511365Z #16 exporting cache to registry
2026-06-09T16:08:29.125747781Z #16 writing cache image manifest sha256:ef6cb358548268d0dcbc2997ff8d3cc3072418f133f31d353cd7d9ae8f69199b
2026-06-09T16:08:29.272228352Z #16 sending cache export 15.2s done
2026-06-09T16:08:29.272255893Z #16 writing cache image manifest sha256:ef6cb358548268d0dcbc2997ff8d3cc3072418f133f31d353cd7d9ae8f69199b 0.1s done
2026-06-09T16:08:29.272260693Z #16 DONE 15.2s
2026-06-09T16:08:29.346210193Z ------
2026-06-09T16:08:29.346228753Z  > importing cache manifest from image-registry-v2.aws-us-east-2-2.internal.render.com/srv-d8k3jureo5us73elh6c0:buildcache:
2026-06-09T16:08:29.346235664Z ------
2026-06-09T16:08:34.254354832Z ==> Deploying...
2026-06-09T16:08:34.349141284Z ==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
2026-06-09T16:09:14.83489523Z /app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103
2026-06-09T16:09:14.836714227Z         throw new Error(errorMessage);
2026-06-09T16:09:14.836722587Z               ^
2026-06-09T16:09:14.836724957Z 
2026-06-09T16:09:14.836727447Z Error: Node.js 20 detected without native WebSocket support.
2026-06-09T16:09:14.836738418Z 
2026-06-09T16:09:14.836741618Z Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
2026-06-09T16:09:14.836745559Z import ws from "ws"
2026-06-09T16:09:14.836747789Z new RealtimeClient(url, { transport: ws })
2026-06-09T16:09:14.836750639Z     at WebSocketFactory.getWebSocketConstructor (/app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103:15)
2026-06-09T16:09:14.836752909Z     at RealtimeClient._initializeOptions (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:642:164)
2026-06-09T16:09:14.836754989Z     at new RealtimeClient (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:185:43)
2026-06-09T16:09:14.836756989Z     at SupabaseClient._initRealtimeClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:839:10)
2026-06-09T16:09:14.836759099Z     at new SupabaseClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:674:24)
2026-06-09T16:09:14.8367613Z     at createClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:872:9)
2026-06-09T16:09:14.83676326Z     at file:///app/server/utils/supabaseAdmin.js:17:30
2026-06-09T16:09:14.83676607Z     at ModuleJob.run (node:internal/modules/esm/module_job:325:25)
2026-06-09T16:09:14.83676807Z     at async ModuleLoader.import (node:internal/modules/esm/loader:606:24)
2026-06-09T16:09:14.83677011Z     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
2026-06-09T16:09:14.83677199Z 
2026-06-09T16:09:14.83677398Z Node.js v20.20.2
2026-06-09T16:09:16.319947271Z ==> Exited with status 1
2026-06-09T16:09:16.321995755Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
2026-06-09T16:09:18.669023609Z /app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103
2026-06-09T16:09:18.669073112Z         throw new Error(errorMessage);
2026-06-09T16:09:18.669077862Z               ^
2026-06-09T16:09:18.669081192Z 
2026-06-09T16:09:18.669084682Z Error: Node.js 20 detected without native WebSocket support.
2026-06-09T16:09:18.669087633Z 
2026-06-09T16:09:18.669090963Z Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
2026-06-09T16:09:18.669095673Z import ws from "ws"
2026-06-09T16:09:18.669098743Z new RealtimeClient(url, { transport: ws })
2026-06-09T16:09:18.669102973Z     at WebSocketFactory.getWebSocketConstructor (/app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103:15)
2026-06-09T16:09:18.669106134Z     at RealtimeClient._initializeOptions (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:642:164)
2026-06-09T16:09:18.669109174Z     at new RealtimeClient (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:185:43)
2026-06-09T16:09:18.669112074Z     at SupabaseClient._initRealtimeClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:839:10)
2026-06-09T16:09:18.669115164Z     at new SupabaseClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:674:24)
2026-06-09T16:09:18.669118364Z     at createClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:872:9)
2026-06-09T16:09:18.669120654Z     at file:///app/server/utils/supabaseAdmin.js:17:30
2026-06-09T16:09:18.669123595Z     at ModuleJob.run (node:internal/modules/esm/module_job:325:25)
2026-06-09T16:09:18.669126875Z     at async ModuleLoader.import (node:internal/modules/esm/loader:606:24)
2026-06-09T16:09:18.669130095Z     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
2026-06-09T16:09:18.669132715Z 
2026-06-09T16:09:18.669135435Z Node.js v20.20.2
2026-06-09T16:09:14.83489523Z /app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103
2026-06-09T16:09:14.836714227Z         throw new Error(errorMessage);
2026-06-09T16:09:14.836722587Z               ^
2026-06-09T16:09:14.836724957Z 
2026-06-09T16:09:14.836727447Z Error: Node.js 20 detected without native WebSocket support.
2026-06-09T16:09:14.836738418Z 
2026-06-09T16:09:14.836741618Z Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
2026-06-09T16:09:14.836745559Z import ws from "ws"
2026-06-09T16:09:14.836747789Z new RealtimeClient(url, { transport: ws })
2026-06-09T16:09:14.836750639Z     at WebSocketFactory.getWebSocketConstructor (/app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103:15)
2026-06-09T16:09:14.836752909Z     at RealtimeClient._initializeOptions (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:642:164)
2026-06-09T16:09:14.836754989Z     at new RealtimeClient (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:185:43)
2026-06-09T16:09:14.836756989Z     at SupabaseClient._initRealtimeClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:839:10)
2026-06-09T16:09:14.836759099Z     at new SupabaseClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:674:24)
2026-06-09T16:09:14.8367613Z     at createClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:872:9)
2026-06-09T16:09:14.83676326Z     at file:///app/server/utils/supabaseAdmin.js:17:30
2026-06-09T16:09:14.83676607Z     at ModuleJob.run (node:internal/modules/esm/module_job:325:25)
2026-06-09T16:09:14.83676807Z     at async ModuleLoader.import (node:internal/modules/esm/loader:606:24)
2026-06-09T16:09:14.83677011Z     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
2026-06-09T16:09:14.83677199Z 
2026-06-09T16:09:14.83677398Z Node.js v20.20.2
2026-06-09T16:09:16.319947271Z ==> Exited with status 1
2026-06-09T16:09:16.321995755Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
2026-06-09T16:09:18.669023609Z /app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103
2026-06-09T16:09:18.669073112Z         throw new Error(errorMessage);
2026-06-09T16:09:18.669077862Z               ^
2026-06-09T16:09:18.669081192Z 
2026-06-09T16:09:18.669084682Z Error: Node.js 20 detected without native WebSocket support.
2026-06-09T16:09:18.669087633Z 
2026-06-09T16:09:18.669090963Z Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
2026-06-09T16:09:18.669095673Z import ws from "ws"
2026-06-09T16:09:18.669098743Z new RealtimeClient(url, { transport: ws })
2026-06-09T16:09:18.669102973Z     at WebSocketFactory.getWebSocketConstructor (/app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103:15)
2026-06-09T16:09:18.669106134Z     at RealtimeClient._initializeOptions (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:642:164)
2026-06-09T16:09:18.669109174Z     at new RealtimeClient (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:185:43)
2026-06-09T16:09:18.669112074Z     at SupabaseClient._initRealtimeClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:839:10)
2026-06-09T16:09:18.669115164Z     at new SupabaseClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:674:24)
2026-06-09T16:09:18.669118364Z     at createClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:872:9)
2026-06-09T16:09:18.669120654Z     at file:///app/server/utils/supabaseAdmin.js:17:30
2026-06-09T16:09:18.669123595Z     at ModuleJob.run (node:internal/modules/esm/module_job:325:25)
2026-06-09T16:09:18.669126875Z     at async ModuleLoader.import (node:internal/modules/esm/loader:606:24)
2026-06-09T16:09:18.669130095Z     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
2026-06-09T16:09:18.669132715Z 
2026-06-09T16:09:18.669135435Z Node.js v20.20.2