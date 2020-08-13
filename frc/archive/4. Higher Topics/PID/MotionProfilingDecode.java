/**
 * Motion profiling controller
 * @author Connor_Hofenbitzer
 */
public class EnhancedProfileCreator extends Controller {

  //in seconds
  private ControlPresets controls;
  private final double DT = 0.02;

  //start and end
  private double endP;
  private double startP;

  //outputs
  private boolean done;
  private double[] outputs;

  //bounds
  private double maxVelocity;
  private double maxAcceleration;

  //cruizing
  private double travelDist;
  private double adjMaxVelocity; //adjusted max velocity
  private boolean isTrapezoidal;

  //accel and decel distances
  private boolean backwards;
  private double accelDistance;
  private double cruizingDistance;

  //future values
  private double nextVelocity;


  /**
   * New profile maker and follower
   * @param presets : control gains and stuff
   */
  public EnhancedProfileCreator(ControlPresets presets) {

    //start and end
    endP = 0;
    startP = 0;
    controls = presets;

    //outputs
    done = false;
    outputs = new double[3];

    //bounds
    maxVelocity = presets.getmaxVel();
    maxAcceleration = presets.getmaxAcc();

    //cruizing
    travelDist = 0;
    isTrapezoidal = false;
    adjMaxVelocity = maxVelocity;

    //accel and decel distances
    backwards = false;
    accelDistance = 0;
    cruizingDistance = 0;

    //future values
    nextVelocity = 0;


  }


  /**
   * Sets the motion controllers setpoints
   * @param currentPos : mechanisms current position
   * @param setPoint : the position you want the mechanism at
   */
  @Override
  public void setSetpoint(double currentPos, double setPoint) {

    done = false;
    endP = setPoint;
    nextVelocity = 0;
    startP = currentPos;
    outputs = new double[3];

    outputs[0] = currentPos;
    outputs[1] = 0;
    outputs[2] = 0;

    //path stuff
    /* The first line detects whether we should move forwards or backwards.
    The second line gives us the distance we need to travel.
    */
    backwards = currentPos > setPoint;
    travelDist = Math.abs(setPoint - currentPos);

    // Finds the fastest velocity you will be traveling at.
    /* The first line is a kinematic. The distance is divided by 2
    because you should be reaching your max speed at most halfway through your trajectory.
    Motion profiles are symmetric, after all.
    The second line uses the same kinematic to calculate the distance traveled during acceleration.
    */
    adjMaxVelocity = Math.min(maxVelocity ,Math.sqrt(2 * maxAcceleration * (travelDist/2)));
    accelDistance  = (adjMaxVelocity*adjMaxVelocity) / (2*maxAcceleration);

    //trapezoidal vs triangular
    /* Sometimes the distance traveled during acceleration is no less than half the travel distance.
    In this case, the motion profile looks like a triangle (△) on a velocity-time graph.
    If it's trapezoidal, then the distance traveled during acceleration is less than half the travel distance.
    In this case, the motion profile looks like an isosceles trapezoid (╱==╲) on a v-t graph.
    */
    isTrapezoidal  = (accelDistance < (travelDist / 2));
    cruizingDistance = (isTrapezoidal) ? (travelDist - (2*accelDistance)) : 0;

 //   System.out.println("setpoint " + setPoint + " " + isTrapezoidal + " " + cruizingDistance);

  }

  @Override
  public void changeGains(ControlPresets preset) {
    controls = preset;
  }


  /**
   * Calculates an output for the mechanism to follow the profile
   * @param currentPos: mechanisms current position
   * @return : the output to send to the motor
   */
  @Override
  public double calculate(double currentPos) {

    if(!done) {

      //find distances to start and finish
      double distanceFromEnd = Math.abs(endP - currentPos);
      double distanceFromStart = Math.abs(startP - currentPos);

      //calculate the min and max velocitys
      /* This is just all the same kinematic. v^2 = (v_i)^2 + 2ax
      */
      double maxReachVel = (nextVelocity*nextVelocity)/2 + (maxAcceleration*distanceFromEnd);
      double minReachVel = (nextVelocity*nextVelocity)/2 - (maxAcceleration*distanceFromEnd);

      double newAdjMaxVelocity = nextVelocity;

      //make sure the velocity is non-negative
      if(!backwards) {
        if(minReachVel < 0 || newAdjMaxVelocity < 0) {
          //System.out.println("enganging the special sauce");
          newAdjMaxVelocity = Math.min(adjMaxVelocity, Math.sqrt(maxReachVel));
        }
      } else {
        if(minReachVel < 0) {
         // System.out.println("enganging the special sauce , the crabby patty sauce");
          newAdjMaxVelocity = Math.min(adjMaxVelocity, Math.sqrt(maxReachVel));
        }
      }


      //first leg of trap or triangle.
      // The "else if" is for the last leg of trap or triangle.
      if(distanceFromStart <= accelDistance) {
        //sets the output array
        setOutputArray(nextVelocity*DT + (0.5)*(maxAcceleration)*(DT*DT),
             nextVelocity + (maxAcceleration * DT),
             maxAcceleration);

      } else if (distanceFromStart > (accelDistance + cruizingDistance) ) {
        //sets the output array
        setOutputArray(newAdjMaxVelocity*DT - (0.5)*maxAcceleration*(DT*DT),
            newAdjMaxVelocity - (maxAcceleration * DT),
            -maxAcceleration);

      }


    //path is done
      if(distanceFromStart >= travelDist) {
        setOutputArray(endP, 0 , 0);
        done = true;
        return 0.0;
      }


      //cruizing part
      if(isTrapezoidal && (distanceFromStart <= (accelDistance + cruizingDistance))
         && (distanceFromStart > accelDistance) ) {
        //sets the output array
        setOutputArray(adjMaxVelocity*DT, adjMaxVelocity, 0);
      }

      /* This is not PIDF.
      This is three concurrent P loops.
      The first of them is for the velocity.
      The second is for the acceleration.
      The third is for the position.
      */
      return (outputs[1]*controls.getkF()) + ((outputs[2]*controls.getkA())) + (((outputs[0] - currentPos)*controls.getkP()));
   }

    return 0.0;
  }

  /**
   * Sets the output array
   * @param nextDist  : robots desired position
   * @param nextVel   : robots desired velocity
   * @param nextAccel : robots desired acceleration
   */
  private void setOutputArray(double nextDist, double nextVel , double nextAccel) {
    outputs[0] += nextDist*(backwards?-1:1);
    outputs[1]  = nextVel*(backwards?-1:1);
    outputs[2]  = nextAccel*(backwards?-1:1);
    nextVelocity = nextVel;
  }


  @Override
  public boolean isDone() {
    return done;
  }




}