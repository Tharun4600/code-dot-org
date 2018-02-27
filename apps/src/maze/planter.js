import Subtype from './subtype';
import PlanterCell from './planterCell';
import PlanterDrawer from './planterDrawer';
import mazeMsg from './locale';
import { TestResults } from '../constants.js';

const TerminationValue = {
  PLANT_IN_NON_SOIL: 0,
  DID_NOT_PLANT_EVERYWHERE: 1,
};

export default class Planter extends Subtype {

  reset() {
    this.maze_.map.forEachCell(cell => {
      cell.resetCurrentFeature();
    });
  }

  /**
   * @override
   */
  succeeded() {
    return this.plantedEverything();
  }

  /**
   * Has the user planted everywhere they can plant? Alternatively, are
   * there zero Soil cells?
   */
  plantedEverything() {
    const anySoilCells = this.maze_.map.getAllCells().some(cell => cell.isSoil());
    return !anySoilCells;
  }

  /**
   * @override
   */
  shouldCheckSuccessOnMove() {
    return false;
  }

  /**
   * @override
   */
  getCellClass() {
    return PlanterCell;
  }

  /**
   * @override
   */
  createDrawer(svg) {
    this.drawer = new PlanterDrawer(this.maze_.map, this.skin_, svg, this);
  }

  atSprout() {
    return this.atType(PlanterCell.FeatureType.SPROUT);
  }

  atSoil() {
    return this.atType(PlanterCell.FeatureType.SOIL);
  }

  atType(type) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    return cell.featureType() === type;
  }

  /**
   * Attempt to plant a sprout at the current location; terminate the execution
   * if this is not a valid place at which to plant.
   *
   * This method is preferred over animatePlant for "headless" operation (ie
   * when validating quantum levels)
   *
   * @return {boolean} whether or not this attempt was successful
   */
  plant() {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== PlanterCell.FeatureType.SOIL) {
      this.maze_.executionInfo.terminateWithValue(TerminationValue.PLANT_IN_NON_SOIL);
      return false;
    }

    cell.setFeatureType(PlanterCell.FeatureType.SPROUT);
    return true;
  }

  /**
   * Display the planting of a sprout at the current location; raise a runtime
   * error if the current location is not a valid spot at which to plant.
   *
   * This method is preferred over plant for live operation (ie when actually
   * displaying something to the user)
   *
   * @throws Will throw an error if the current cell has no nectar.
   */
  animatePlant() {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== PlanterCell.FeatureType.SOIL) {
      throw new Error("Shouldn't be able to plant in anything but soil");
    }

    cell.setFeatureType(PlanterCell.FeatureType.SPROUT);
    this.drawer.updateItemImage(row, col, true);
  }

  /**
   * @override
   */
  terminateWithAppSpecificValue() {
    const executionInfo = this.maze_.executionInfo;

    if (!this.plantedEverything()) {
      executionInfo.terminateWithValue(TerminationValue.DID_NOT_PLANT_EVERYWHERE);
    }
  }

  /**
   * @override
   */
  getTestResults(terminationValue) {
    switch (terminationValue) {
      case TerminationValue.PLANT_IN_NON_SOIL:
        return TestResults.APP_SPECIFIC_FAIL;
      case TerminationValue.DID_NOT_PLANT_EVERYWHERE:
        var testResults = this.maze_.getTestResults(true);
        // If we have a non-app specific failure, we want that to take precedence.
        // Values over TOO_MANY_BLOCKS_FAIL are not true failures, but indicate
        // a suboptimal solution, so in those cases we want to return our
        // app specific fail. Same goes for BLOCK_LIMIT_FAIL.
        if (testResults >= TestResults.TOO_MANY_BLOCKS_FAIL || testResults === TestResults.BLOCK_LIMIT_FAIL) {
          testResults = TestResults.APP_SPECIFIC_FAIL;
        }
        return testResults;
      default:
        return super.getTestResults(terminationValue);
    }
  }

  /**
   * @override
   */
  hasMessage(testResults) {
    return testResults === TestResults.APP_SPECIFIC_FAIL;
  }

  /**
   * @override
   */
  getMessage(terminationValue) {
    switch (terminationValue) {
      case TerminationValue.PLANT_IN_NON_SOIL:
        return mazeMsg.plantInNonSoilError();
      case TerminationValue.DID_NOT_PLANT_EVERYWHERE:
        return mazeMsg.didNotPlantEverywhere();
      default:
        return super.getMessage(terminationValue);
    }
  }
}

Planter.TerminationValue = TerminationValue;
