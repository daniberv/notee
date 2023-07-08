export default function isPromise(object) {
  return object && typeof object.then === 'function';
}