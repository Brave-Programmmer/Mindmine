
export default function FlippingPageBook() {
  return (
    <div className="relative w-64 h-80">
      {/* <!-- Book 1 --> */}
      <div className="absolute w-48 h-64 bg-white rounded-lg shadow-lg transform rotate-[-5deg] animate-float-slow">
        <div className="absolute inset-0 bg-rosewood opacity-10 rounded-lg"></div>
        <div className="absolute top-4 left-4 w-8 h-8 bg-mauve rounded-full"></div>
        <div className="absolute top-4 right-4 w-16 h-2 bg-gold rounded-full"></div>
        <div className="absolute top-16 left-4 w-32 h-2 bg-gold rounded-full"></div>
        <div className="absolute top-24 left-4 w-24 h-2 bg-gold rounded-full"></div>
      </div>
      {/* <!-- Book 2 --> */}
      <div className="absolute w-48 h-64 bg-white rounded-lg shadow-lg transform rotate-[5deg] translate-x-8 translate-y-4 animate-float">
        <div className="absolute inset-0 bg-sienna opacity-10 rounded-lg"></div>
        <div className="absolute top-4 left-4 w-8 h-8 bg-mauve rounded-full"></div>
        <div className="absolute top-4 right-4 w-16 h-2 bg-gold rounded-full"></div>
        <div className="absolute top-16 left-4 w-32 h-2 bg-gold rounded-full"></div>
        <div className="absolute top-24 left-4 w-24 h-2 bg-gold rounded-full"></div>
      </div>
      {/* <!-- Book 3 --> */}
      <div className="absolute w-48 h-64 bg-white rounded-lg shadow-lg transform rotate-[-8deg] translate-x-[-8px] translate-y-8 animate-float-slow">
        <div className="absolute inset-0 bg-gold opacity-10 rounded-lg"></div>
        <div className="absolute top-4 left-4 w-8 h-8 bg-mauve rounded-full"></div>
        <div className="absolute top-4 right-4 w-16 h-2 bg-gold rounded-full"></div>
        <div className="absolute top-16 left-4 w-32 h-2 bg-gold rounded-full"></div>
        <div className="absolute top-24 left-4 w-24 h-2 bg-gold rounded-full"></div>
      </div>
    </div>
  );
}
