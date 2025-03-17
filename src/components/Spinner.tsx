const Spinner = ({ size = "w-24 h-24 border-8" }: { size?: string }) => (
    <div className={`${size} border-blue-500 border-t-transparent rounded-full animate-spin transition-all ease-in-out duration-500`}></div>
);

export default Spinner;
