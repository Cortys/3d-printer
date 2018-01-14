#!/usr/bin/python
# -*- coding: utf-8 -*-

#Hinweise:
#speed ca.0.0002 /Max bei Normalbetrieb 0.00016, bei 25% Absenkung 0.0008


import RPi.GPIO as GPIO
import math
import itertools
import sys
import timing

xy_scale = 0.07
scales = [xy_scale, xy_scale, 0.02, 1]
motor_pins = [[2, 3], [4, 17], [27, 22], [10, 9]]    #[TAKT,RICHTUNG]
button_pins = [16, 20, 21]

class MotorController:
    def __init__(self, motors, buttons, scales):
        self.motors = motors
        self.buttons = buttons
        self.scales = scales
        self.setupMotors()    #aufruf der Setup Funktion
        self.setupButtons()

    def setupMotors(self):     # IO Pins belgegen mit Takt und Richtung
        GPIO.setmode(GPIO.BCM)
        for motor in self.motors:
            GPIO.setup(motor[0],GPIO.OUT)  #motor Takt
            GPIO.setup(motor[1],GPIO.OUT) #motor Richtung

    def setupButtons(self):
        for button in self.buttons:
            GPIO.setup(button, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

    def rotateCoordinates(self, x, y):    #Koordinatensystem um 45° drehen    Rückgabe: 2 Feld Array
        return [-int(round(x * math.cos(math.pi/4) - y * math.sin(math.pi/4))),
                -int(round(x * math.sin(math.pi/4) + y * math.cos(math.pi/4)))]

    def convertDistancesToSteps(self, distances, speed):
        xSteps = distances[0] / self.scales[0]  #eingabe X Wert
        ySteps = distances[1] / self.scales[1]  #eingabe Y Wert
        zSteps = distances[2] / self.scales[2]    #eingabe Z Wert
        eSteps = distances[3] / self.scales[3]    #eingabe E Wert
        total_time = math.fsum([distance**2 for distance in distances])**0.5 / (speed / 60)

        return [self.rotateCoordinates(xSteps, ySteps) + [zSteps, eSteps], total_time]

    def _move(self, distances, speed, stopFn):  #3 Achsen Bewegung Steps: 3Feld Array
        [steps, total_time] = self.convertDistancesToSteps(distances, speed)

        if all(step == 0 for step in steps):
            return

        for i in range(len(self.motors)): #Richtung bestimmen
            if steps[i] > 0:    #Poitive Richtung
                GPIO.output(self.motors[i][1], 0)
            else:                #Negative Richtung
                GPIO.output(self.motors[i][1], 1)
                steps[i] *= -1

        counter = [0.0] * len(self.motors)
        time_delays = [(total_time/step if step != 0 else float('inf')) for step in steps]
        min_delay = min(time_delays)
        step_delays = [time_delay/min_delay for time_delay in time_delays]
        max_steps = int(max(steps))
        delay = int(min_delay*(10**6)) - 1

        #Ausgabe zur Testzwecken
        # print(total_time)
        # print(steps)
        # print(time_delays)
        # print(min_delay)
        # print(step_delays)
        # print(max_steps)

        for i in itertools.count(0, 1): #Steps abarbeiten range(int)???
            if stopFn(i, max_steps):
                break

            for j in range(len(self.motors)):
                GPIO.output(self.motors[j][0],0)
            timing.delayMicroseconds(1)
            for j in range(len(self.motors)):
                counter[j] += 1
                if counter[j] >= step_delays[j]:
                    GPIO.output(self.motors[j][0],1)
                    counter[j] -= step_delays[j]
            timing.delayMicroseconds(delay)

    def move(self, distances, speed):
        self._move(distances, speed, lambda i, max_steps: i >= max_steps)

    def reference(self):
        def buttonPushed(button):
            return lambda i, max_count: GPIO.input(button)

        # while True:
        #     print(GPIO.input(16))
        #     timing.delayMicroseconds(20000)

        print("info reference z")
        self._move([0, 0, 1, 0], 600, buttonPushed(self.buttons[2]))
        self.move([0, 0, -5, 0], 1500)

        print("info reference y")
        self._move([0, 1, 0, 0], 600, buttonPushed(self.buttons[1]))
        self.move([0, -5, 0, 0], 3000)

        print("info reference x")
        self._move([-1, 0, 0, 0], 600, buttonPushed(self.buttons[0]))
        self.move([5, 0, 0, 0], 3000)

#Hauptprogramm
def main():
    controller = MotorController(motor_pins, button_pins, scales)    #Controller erstellen mit def. Ausgangs GPIO

    print("init ")

    while True:
        try:
            [cid, command, args] = input()

            print("received " + str(cid) + " " + str(command) + " " + str(args))

            try:
                if command == "reference":
                    controller.reference()
                    print("success " + str(cid))
                elif command == "move":
                    [distances, speed] = args
                    controller.move(distances, speed)
                    print("success " + str(cid))
                elif command == "exit":
                    print("success " + str(cid))
                    break
                else:
                    print("fail " + str(cid))
            except Exception:
                print("fail " + str(cid))
        except KeyboardInterrupt:
            print("exit ")
            break
        except ValueError:
            print("fail ")

try:
     main() #aufruf der main Funktion
finally:
     GPIO.cleanup()
