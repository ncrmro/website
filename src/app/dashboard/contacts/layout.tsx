export default function ContactsLayout(props) {
  return (
    <div className="bg-gray-900">
      <div className="mx-auto max-w-7xl">{props.children}</div>
    </div>
  );
}
