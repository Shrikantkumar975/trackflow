import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, MapPin, ShieldCheck } from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-300 to-brand-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
              Real-Time Logistics <br/>
              <span className="text-brand-600">Reimagined</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
              TrackFlow empowers customers, agents, and admins with a state-of-the-art delivery tracking system. Monitor shipments, manage fleets, and track deliveries in real-time.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/register" className="rounded-md bg-brand-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all transform hover:scale-105">
                Get Started
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900 flex items-center gap-1 hover:text-brand-600 transition-colors">
                Login to your account <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-600">Deliver Faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to manage logistics</p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  Real-Time Live Tracking
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">Watch deliveries move on the map live with Socket.io powered instant updates.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  Agent Fleet Management
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">Effortlessly assign packages to agents and track their progress through the delivery lifecycle.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  Secure Role-Based Access
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">Dedicated dashboards for customers, delivery agents, and administrators.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  Instant Status Updates
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">Know exactly when an order is picked up, in transit, and delivered without refreshing the page.</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
