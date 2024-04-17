/* eslint-disable no-underscore-dangle */
export class ChartBinderUtils {
  /**
   * Singleton based class for binding functionality
   * between different entity (components / classes /...)
   * All you need to do is to instantiate this class
   * and set/get your reference function.
   */

  static _instance: ChartBinderUtils;
  _references = {};

  constructor() {
    if (ChartBinderUtils._instance) {
      return ChartBinderUtils._instance;
    }
    ChartBinderUtils._instance = this;
  }

  setReferenceObject(name, object) {
    this._references[name] = object;
  }

  getReference(name) {
    try {
      const ref = this._references[name];
      if (ref) {
        return ref;
      }
    } catch (unused) {
      return null;
    }
  }
}
