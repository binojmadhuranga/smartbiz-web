
const Input = ({ label, type = 'text', name, value, onChange, placeholder, required = false, className = '', ...props }) => (
  <div className="flex flex-col w-full">
    {label && <label className="text-xs font-semibold text-gray-700 mb-1" htmlFor={name}>{label}</label>}
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`py-2 px-3 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-sm ${className}`}
      {...props}
    />
  </div>
);

export default Input;