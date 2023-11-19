export default function CreateContactPage() {
  return <form>
    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
      <div className="sm:col-span-4">
        <label htmlFor="username" className="block text-sm font-medium leading-6 text-white">
          Username
        </label>
        <div className="mt-2">
          <div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
            <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">workcation.com/</span>
            <input
                type="text"
                name="username"
                id="username"
                autoComplete="username"
                className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="janesmith"
            />
          </div>
        </div>
      </div>
    </div>
  </form>;
}
