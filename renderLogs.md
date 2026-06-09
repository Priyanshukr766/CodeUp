June 9, 2026 at 9:18 PM
failed
9308387
Some changes

Rollback
Exited with status 1 while running your code.
Read our docs for common ways to troubleshoot your deploy.

2026-06-09T15:50:22.422378261Z #12 0.268 npm warn config production Use `--omit=dev` instead.
2026-06-09T15:50:23.89710339Z #12 1.743 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
2026-06-09T15:50:24.373239326Z #12 2.219 
2026-06-09T15:50:24.373257506Z #12 2.219 added 139 packages, and audited 140 packages in 2s
2026-06-09T15:50:24.373261226Z #12 2.219 
2026-06-09T15:50:24.373265506Z #12 2.219 25 packages are looking for funding
2026-06-09T15:50:24.525471227Z #12 2.219   run `npm fund` for details
2026-06-09T15:50:24.525489677Z #12 2.220 
2026-06-09T15:50:24.525493487Z #12 2.220 found 0 vulnerabilities
2026-06-09T15:50:24.525496917Z #12 2.221 npm notice
2026-06-09T15:50:24.525501077Z #12 2.221 npm notice New major version of npm available! 10.8.2 -> 11.16.0
2026-06-09T15:50:24.525504797Z #12 2.221 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.16.0
2026-06-09T15:50:24.525508918Z #12 2.221 npm notice To update run: npm install -g npm@11.16.0
2026-06-09T15:50:24.525512218Z #12 2.221 npm notice
2026-06-09T15:50:25.177584406Z #12 DONE 3.0s
2026-06-09T15:50:25.347097236Z 
2026-06-09T15:50:25.347118056Z #13 [8/9] COPY server/ ./server/
2026-06-09T15:50:26.290624476Z #13 DONE 1.1s
2026-06-09T15:50:26.462818171Z 
2026-06-09T15:50:26.462853771Z #14 [9/9] COPY cf_fetcher.py .
2026-06-09T15:50:28.183824433Z #14 DONE 1.9s
2026-06-09T15:50:28.384565701Z 
2026-06-09T15:50:28.384583551Z #15 exporting to image
2026-06-09T15:50:28.384589042Z #15 exporting layers
2026-06-09T15:50:36.141645915Z #15 exporting layers 7.9s done
2026-06-09T15:50:36.263116317Z #15 exporting manifest sha256:d60d2ae0eae020cd80e154e5eafee82fe05c6b0539ba914c903cc2c090ceced1 0.1s done
2026-06-09T15:50:36.263133487Z #15 exporting config sha256:739f42f0257528f7f23e435945800dc3e6f9e5822e49862e6a66878a210bbfd0 0.0s done
2026-06-09T15:50:36.263137257Z #15 DONE 8.0s
2026-06-09T15:50:36.263140617Z 
2026-06-09T15:50:36.263144758Z #16 exporting cache to registry
2026-06-09T15:50:36.263149107Z #16 preparing build cache for export
2026-06-09T15:50:36.437975177Z #16 sending cache export
2026-06-09T15:50:46.335459392Z #16 ...
2026-06-09T15:50:46.335487693Z 
2026-06-09T15:50:46.335494513Z #15 exporting to image
2026-06-09T15:50:46.335499613Z #15 pushing layers
2026-06-09T15:50:49.504624287Z #15 ...
2026-06-09T15:50:49.504647718Z 
2026-06-09T15:50:49.504654568Z #16 exporting cache to registry
2026-06-09T15:50:49.955287144Z #16 ...
2026-06-09T15:50:49.955330354Z 
2026-06-09T15:50:49.955342494Z #15 exporting to image
2026-06-09T15:50:49.955348415Z #15 pushing layers 13.5s done
2026-06-09T15:50:49.955353645Z #15 pushing manifest for image-registry-v2.aws-us-east-2-2.internal.render.com/srv-d8k3bm8g4nts738cjfn0:bld-d8k3bmgg4nts738cjgag@sha256:d60d2ae0eae020cd80e154e5eafee82fe05c6b0539ba914c903cc2c090ceced1 0.2s done
2026-06-09T15:50:49.955358325Z #15 DONE 21.7s
2026-06-09T15:50:50.169266126Z 
2026-06-09T15:50:50.169296047Z #16 exporting cache to registry
2026-06-09T15:50:50.169304477Z #16 writing cache image manifest sha256:17ddd60ceeddf44dd3f391f35d9c9d34e490b1e46ccae61abdbcbaa22cc5d45b
2026-06-09T15:50:50.169343717Z #16 sending cache export 13.9s done
2026-06-09T15:50:50.169351648Z #16 writing cache image manifest sha256:17ddd60ceeddf44dd3f391f35d9c9d34e490b1e46ccae61abdbcbaa22cc5d45b 0.2s done
2026-06-09T15:50:50.169355708Z #16 DONE 13.9s
2026-06-09T15:50:51.401646001Z ------
2026-06-09T15:50:51.401668151Z  > importing cache manifest from image-registry-v2.aws-us-east-2-2.internal.render.com/srv-d8k3bm8g4nts738cjfn0:buildcache:
2026-06-09T15:50:51.401673652Z ------
2026-06-09T15:51:02.182486594Z ==> Deploying...
2026-06-09T15:51:02.37802785Z ==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
2026-06-09T15:51:33.196101577Z /app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103
2026-06-09T15:51:33.196133429Z         throw new Error(errorMessage);
2026-06-09T15:51:33.196137169Z               ^
2026-06-09T15:51:33.19615285Z 
2026-06-09T15:51:33.19615606Z Error: Node.js 20 detected without native WebSocket support.
2026-06-09T15:51:33.19615871Z 
2026-06-09T15:51:33.19616216Z Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
2026-06-09T15:51:33.196166451Z import ws from "ws"
2026-06-09T15:51:33.196169211Z new RealtimeClient(url, { transport: ws })
2026-06-09T15:51:33.196172501Z     at WebSocketFactory.getWebSocketConstructor (/app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103:15)
2026-06-09T15:51:33.196175501Z     at RealtimeClient._initializeOptions (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:642:164)
2026-06-09T15:51:33.196178281Z     at new RealtimeClient (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:185:43)
2026-06-09T15:51:33.196181121Z     at SupabaseClient._initRealtimeClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:839:10)
2026-06-09T15:51:33.196183771Z     at new SupabaseClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:674:24)
2026-06-09T15:51:33.196186592Z     at createClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:872:9)
2026-06-09T15:51:33.196189512Z     at file:///app/server/utils/supabaseAdmin.js:16:30
2026-06-09T15:51:33.196192862Z     at ModuleJob.run (node:internal/modules/esm/module_job:325:25)
2026-06-09T15:51:33.196195612Z     at async ModuleLoader.import (node:internal/modules/esm/loader:606:24)
2026-06-09T15:51:33.196198492Z     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
2026-06-09T15:51:33.196201062Z 
2026-06-09T15:51:33.196203683Z Node.js v20.20.2
2026-06-09T15:51:38.301130256Z ==> Exited with status 1
2026-06-09T15:51:38.304077397Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
2026-06-09T15:51:40.891119815Z /app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103
2026-06-09T15:51:40.891148937Z         throw new Error(errorMessage);
2026-06-09T15:51:40.891153497Z               ^
2026-06-09T15:51:40.891156187Z 
2026-06-09T15:51:40.891158347Z Error: Node.js 20 detected without native WebSocket support.
2026-06-09T15:51:40.891160577Z 
2026-06-09T15:51:40.891165407Z Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
2026-06-09T15:51:40.891168867Z import ws from "ws"
2026-06-09T15:51:40.891170968Z new RealtimeClient(url, { transport: ws })
2026-06-09T15:51:40.891173688Z     at WebSocketFactory.getWebSocketConstructor (/app/server/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103:15)
2026-06-09T15:51:40.891175718Z     at RealtimeClient._initializeOptions (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:642:164)
2026-06-09T15:51:40.891177758Z     at new RealtimeClient (/app/server/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:185:43)
2026-06-09T15:51:40.891179778Z     at SupabaseClient._initRealtimeClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:839:10)
2026-06-09T15:51:40.891181818Z     at new SupabaseClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:674:24)
2026-06-09T15:51:40.891184288Z     at createClient (file:///app/server/node_modules/@supabase/supabase-js/dist/index.mjs:872:9)
2026-06-09T15:51:40.891187779Z     at file:///app/server/utils/supabaseAdmin.js:16:30
2026-06-09T15:51:40.891191709Z     at ModuleJob.run (node:internal/modules/esm/module_job:325:25)
2026-06-09T15:51:40.891194759Z     at async ModuleLoader.import (node:internal/modules/esm/loader:606:24)
2026-06-09T15:51:40.891197739Z     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
2026-06-09T15:51:40.891200639Z 
2026-06-09T15:51:40.891203389Z Node.js v20.20.2