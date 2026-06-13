import foodImage from "../../assets/food.png";

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="min-h-screen bg-[#fff9f4]">
      <div className="mx-auto grid min-h-screen w-full w-100vw lg:grid-cols-[42%_58%]">
        <section className="flex flex-col bg-white px-5 py-6 sm:px-10 sm:py-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500 text-base font-bold text-white">
              R
            </div>
            <div>
              <p className="text-[1rem] font-bold leading-none text-zinc-900">
                ROMS Admin
              </p>
              <p className="mt-1 text-xs tracking-[0.2em] text-zinc-500">
                RESTAURANT OPS
              </p>
            </div>
          </div>

          <div className="my-auto w-full max-w-[560px]">
            <h1 className="text-[2.45rem] font-bold tracking-tight text-zinc-900 sm:text-[3.25rem]">
              {title}
            </h1>
            <p className="mt-0 text-lg text-zinc-600">{subtitle}</p>

            <div className="mt-8 sm:mt-10">{children}</div>
            {footer ? (
              <div className="mt-7 text-sm text-zinc-600">{footer}</div>
            ) : null}
          </div>

          <p className="text-[11px] font-medium tracking-[0.14em] text-zinc-400">
            SYSTEM STATUS: ONLINE
          </p>
        </section>

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#ff8a2b] via-[#f89f53] to-[#f3ddca] px-8 py-7 text-white lg:flex lg:flex-col xl:px-10">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-black/20 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between">
            <span className="rounded-full border border-white/45 bg-white/20 px-4 py-2 text-[10px] font-semibold tracking-[0.16em]">
              ENTERPRISE KITCHEN CENTRAL V2
            </span>
            <div className="text-right">
              <p className="text-4xl font-bold leading-none xl:text-5xl">
                12.4k
              </p>
              <p className="mt-1 text-xs font-semibold tracking-[0.19em] text-white/90">
                ACTIVE ORDERS
              </p>
            </div>
          </div>

          <div className="relative z-10 my-auto flex justify-center">
            <div className="w-full max-w-170 rounded-xl border border-white/35 bg-[#2d261e] p-3 shadow-[0_24px_55px_rgba(0,0,0,0.35)] xl:p-4">
              <img
                src={foodImage}
                alt="Signature dish"
                className="aspect-[14/9] w-full rounded-xl object-cover"
              />
            </div>

            <div className="absolute -bottom-6 right-0 w-100 rounded-xl border border-white/40 bg-black/40 p-4 backdrop-blur-xl xl:w-80">
              <p className="text-lg font-semibold leading-none">
                Live Kitchen Performance
              </p>
              <div className="mt-3 h-2 rounded-full bg-white/25">
                <div className="h-full w-[96%] rounded-full bg-white" />
              </div>
              <p className="mt-3 text-xs text-white/90 xl:text-base">
                96% order accuracy maintained across all active terminals today.
              </p>
            </div>
          </div>

          <div className="w-full relative z-10  ">
            <p className="font-bold leading-[0.98] text-4xl ">
              The heartbeat of modern hospitality.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthShell;
