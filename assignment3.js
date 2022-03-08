import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;
// Makes these shapes usable
const {Cube, Triangle, Square, Tetrahedron, Windmill, Cylindrical_Tube, Textured_Phong} = defs;


/*class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}*/

export class Assignment3 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere1: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
            sphere2 : new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
            sphere3: new defs.Subdivision_Sphere(3),
            sphere4: new defs.Subdivision_Sphere(4),
            moon: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),
            cube: new Cube(),
            cup: new Cylindrical_Tube(15,15),
            comps: new Cube(),
        };
        console.log(this.shapes.comps.arrays.texture_coord)

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .1, diffusivity: .6, color: hex_color("#ffffff")}),
            ring: new Material(new Ring_Shader()),
            sun: new Material(new defs.Phong_Shader(),
                {ambient: 1, color: hex_color("#ffffff")}),
            moon: new Material(new defs.Phong_Shader(),
                {ambient: 0, color: hex_color("#cacaca")}),
            book_filling: new Material(new defs.Phong_Shader(),
                {ambient: 0.2, diffusivity: .6, color: hex_color("#ffffff")}),
            book_1_cover: new Material(new defs.Phong_Shader(),
                {ambient: 0.2, diffusivity: .6, color: hex_color("#d70f0f")}),
            wood: new Material(new defs.Phong_Shader(),
                {ambient: 0.2, diffusivity: 0.8, specularity: 0.3, color: hex_color("#663300")}),
            ceramic: new Material(new defs.Phong_Shader(),
                {ambient: 0.7, diffusivity: 0.6, specularity: 0.3, color: color(1,0.95,0.9,1)}),
            screen: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/lofi.png", "NEAREST")
            }),
            bmetal: new Material(new defs.Phong_Shader(),
                {ambient: 0.6, diffusivity: 0.6, specularity: 0.7, color: hex_color("#000000")}),
        }

        this.toggle = {
            table: true,
            book: true,
            chair: true,
            mug: true,
            computer: true,
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 35), vec3(0, 6, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Toggle Table", ["Control", "0"], () => this.toggle.table = !this.toggle.table);
        this.new_line();
        this.key_triggered_button("Toggle Chair", ["Control", "1"], () => this.toggle.chair = !this.toggle.chair);
        this.new_line();
        this.key_triggered_button("Toggle Book", ["Control", "2"], () => this.toggle.book = !this.toggle.book);
        this.key_triggered_button("Toggle Mug", ["Control", "3"], () => this.toggle.mug = !this.toggle.mug);
        this.key_triggered_button("Toggle Computer", ["Control", "4"], () => this.toggle.computer = !this.toggle.computer);

    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        const yellow = hex_color("#fac91a");
        let model_transform = Mat4.identity();
        const light_rotation_matrix = Mat4.rotation(t, 0, 0, 1);
        const light_position = light_rotation_matrix.times(vec4(20, 6, -22, 1));

        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        // drawing the sun
        const white = hex_color("#ffffff");
        const sun_radius = 2 + Math.sin(2 * Math.PI * t / 10);
        const sun_color = color(1, (sun_radius / 2 - 0.5), (sun_radius / 2 - 0.5), 1);
        //this.shapes.torus.draw(context, program_state, model_transform, this.materials.test.override({color: yellow}));

        let model_transform_sun = model_transform.times(light_rotation_matrix)
            .times(Mat4.scale(2, 2, 2))
            .times(Mat4.translation(10,3,-10));
        this.shapes.sphere4.draw(context, program_state, model_transform_sun, this.materials.sun.override({color: sun_color}));

        let model_transform_moon = model_transform.times(light_rotation_matrix)
            .times(Mat4.scale(2, 2, 2))
            .times(Mat4.translation(-10,3,-10));
        this.shapes.moon.draw(context, program_state, model_transform_moon, this.materials.moon);

        // drawing the light
        const light_size = 5000 * sun_radius;
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), light_size)];

        // Table
        let model_transform_leg = model_transform.times(Mat4.translation(0, -6, 0))
            .times(Mat4.scale(0.5,3,0.5));
        let model_transform_counter = model_transform.times(Mat4.translation(-2.5, -2.5, -2.5))
            .times(Mat4.scale(8,0.5,5));

        // Chair
        let model_transform_ch_leg = model_transform.times(Mat4.translation(12, -7, 1))
            .times(Mat4.scale(0.5,2,0.5));
        let model_transform_seat = model_transform.times(Mat4.translation(10.5, -4.75, -1))
            .times(Mat4.scale(3,0.3,3));
        let model_transform_back = model_transform.times(Mat4.translation(13.2, -1, -1))
            .times(Mat4.scale(0.3, 4,3));
        let model_transform_arm = model_transform.times(Mat4.translation(7.8, -3.5, 1.7))
            .times(Mat4.scale(0.3,1,0.3));
        let model_transform_armrest = model_transform.times(Mat4.translation(10.5, -2.25, 1.7))
            .times(Mat4.scale(3,0.3,0.3));

        // Book
        let model_transform_book1 = model_transform.times(Mat4.translation(-3, -1.8, 0))
            .times(Mat4.scale(1, 0.15, 1.5));
        let model_transform_book1_bottom = model_transform_book1.times(Mat4.scale(1.1, 0.2, 1.1))
            .times(Mat4.translation(0.05, -6, 0));
        let model_transform_book1_top = model_transform_book1_bottom.times(Mat4.translation(0, 12, 0));
        let model_transform_book1_binding = model_transform.times(Mat4.translation(-3.945, -1.8, 0))
            .times(Mat4.scale(0.10, 0.16, 1.65));

        // Mug
        let mug_model_transform = model_transform.times(Mat4.scale(0.68,1.5,0.68))
                                                 .times(Mat4.rotation(4.71239,1,0,0))
                                                 .times(Mat4.translation(-10.295,0,-0.828));
        let mug_base_model_transform = model_transform//.times(Mat4.scale(1,1,1))
                                                      .times(Mat4.rotation(4.71239,1,0,0))
                                                      .times(Mat4.translation(-7,0,-1.99)).times(Mat4.scale(0.68,0.68,1));

        // Room
        let model_transform_floor = model_transform.times(Mat4.translation(0, -9, 0))
            .times(Mat4.scale(40,0.1,40));
        let model_transform_ceiling = model_transform.times(Mat4.translation(0, 31, 0))
            .times(Mat4.scale(40,0.1,40));
        let model_transform_left_wall = model_transform.times(Mat4.translation(-40, 11, 0))
            .times(Mat4.scale(0.1, 20, 40));
        let model_transform_right_wall = model_transform.times(Mat4.translation(40, 11, 0))
            .times(Mat4.scale(0.1, 20, 40));
        let model_transform_front_wall = model_transform.times(Mat4.translation(0, 11, 40))
            .times(Mat4.scale(40, 20, 0.1));
        let model_transform_back_wall_top = model_transform.times(Mat4.translation(0, 26, -15))
            .times(Mat4.scale(20, 5, 0.1));
        let model_transform_back_wall_right = model_transform.times(Mat4.translation(30, 11, -15))
            .times(Mat4.scale(10, 20, 0.1));
        let model_transform_back_wall_bottom = model_transform.times(Mat4.translation(0, -4, -15))
            .times(Mat4.scale(20, 5, 0.1));
        let model_transform_back_wall_left = model_transform.times(Mat4.translation(-30, 11, -15))
            .times(Mat4.scale(10, 20, 0.1));

        // Computer
        let model_transform_screen = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
            .times(Mat4.translation(0, 2.3, -2.8))
            .times(Mat4.scale(0.2,2,3));
        let model_transform_monitor_back = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
            .times(Mat4.translation(-0.4, 2.3, -2.8))
            .times(Mat4.scale(0.3,2.1,3));
        let model_transform_monitor_stand = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
            .times(Mat4.translation(-0.2, -1, -2.8))
            .times(Mat4.scale(0.2,1.2,0.5));
        let model_transform_monitor_base = model_transform.times(Mat4.rotation(Math.PI / 2, 1,0,0))
            .times(Mat4.rotation(Math.PI / 4, 0,0,1))
            .times(Mat4.translation(-0.4, -3, 1.99))
            .times(Mat4.scale(2,2.6,10));
        let model_transform_monitor_left = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
            .times(Mat4.translation(-0.23, 2.35, 0.4 ))
            .times(Mat4.scale(0.45,2.1,0.2));
        let model_transform_monitor_right = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
            .times(Mat4.translation(-0.23, 2.35, -6 ))
            .times(Mat4.scale(0.45,2.1,0.2));
        let model_transform_monitor_above = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
            .times(Mat4.translation(-0.2, 4.5, -2.8))
            .times(Mat4.scale(0.45,0.2,3.425));
        let model_transform_monitor_below = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
            .times(Mat4.translation(-0.2, 0.1, -2.8))
            .times(Mat4.scale(0.45,0.2,3.425));

        this.shapes.cube.draw(context, program_state, model_transform_floor, this.materials.ceramic);
        this.shapes.cube.draw(context, program_state, model_transform_ceiling, this.materials.ceramic);
        this.shapes.cube.draw(context, program_state, model_transform_left_wall, this.materials.ceramic);
        this.shapes.cube.draw(context, program_state, model_transform_right_wall, this.materials.ceramic);
        this.shapes.cube.draw(context, program_state, model_transform_front_wall, this.materials.ceramic);
        this.shapes.cube.draw(context, program_state, model_transform_back_wall_top, this.materials.ceramic);
        this.shapes.cube.draw(context, program_state, model_transform_back_wall_right, this.materials.ceramic);
        this.shapes.cube.draw(context, program_state, model_transform_back_wall_bottom, this.materials.ceramic);
        this.shapes.cube.draw(context, program_state, model_transform_back_wall_left, this.materials.ceramic);

        if(this.toggle.table) {
            this.shapes.cube.draw(context, program_state, model_transform_counter, this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_leg, this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_leg.times(Mat4.translation(-10,0,0)), this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_leg.times(Mat4.translation(0,0,-10)), this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_leg.times(Mat4.translation(-10,0,-10)), this.materials.wood);
        }

        if(this.toggle.chair) {
            this.shapes.cube.draw(context, program_state, model_transform_ch_leg, this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_ch_leg.times(Mat4.translation(-6, 0, 0)), this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_ch_leg.times(Mat4.translation(0, 0, -6)), this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_ch_leg.times(Mat4.translation(-6, 0, -6)), this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_seat, this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_back, this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_arm, this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_arm.times(Mat4.translation(0,0,-18)), this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_armrest, this.materials.wood);
            this.shapes.cube.draw(context, program_state, model_transform_armrest.times(Mat4.translation(0,0,-18)), this.materials.wood);
        }

        if(this.toggle.book) {
            this.shapes.cube.draw(context, program_state, model_transform_book1, this.materials.test);
            this.shapes.cube.draw(context, program_state, model_transform_book1_bottom, this.materials.book_1_cover);
            this.shapes.cube.draw(context, program_state, model_transform_book1_top, this.materials.book_1_cover);
            this.shapes.cube.draw(context, program_state, model_transform_book1_binding, this.materials.book_1_cover);
        }

        if(this.toggle.mug) {
             this.shapes.cup.draw(context, program_state, mug_model_transform, this.materials.ceramic);
             this.shapes.circle.draw(context, program_state, mug_base_model_transform, this.materials.ceramic);
        }

        if(this.toggle.computer) {
            this.shapes.comps.draw(context, program_state, model_transform_screen, this.materials.screen);
            this.shapes.cube.draw(context, program_state, model_transform_monitor_back, this.materials.bmetal);
            this.shapes.cube.draw(context, program_state, model_transform_monitor_left, this.materials.bmetal);
            this.shapes.cube.draw(context, program_state, model_transform_monitor_right, this.materials.bmetal);
            this.shapes.cube.draw(context, program_state, model_transform_monitor_above, this.materials.bmetal);
            this.shapes.cube.draw(context, program_state, model_transform_monitor_below, this.materials.bmetal);
            this.shapes.cube.draw(context, program_state, model_transform_monitor_stand, this.materials.bmetal);
            this.shapes.circle.draw(context,program_state,model_transform_monitor_base,this.materials.bmetal);
           }

        // setting the camera
        if (this.attached) {
            if (this.attached() == this.initial_camera_location) {
                let smoothed = this.initial_camera_location.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
                program_state.set_camera(smoothed);
            }
            else {
                let desired = this.attached().times(Mat4.translation(0, 0, 5));
                desired = Mat4.inverse(desired);
                let smoothed = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
                program_state.set_camera(smoothed);

            }
        }
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
            // The vertex's final resting place (in NDCS):
            gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
            point_position = model_transform * vec4(position, 1.0);
            
            // position of center of the ring
            center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);       
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
            vec3 distance = vec3(point_position.xyz - center.xyz);
            
            // alpha value
            gl_FragColor = vec4(vec3(0.69, 0.5, 0.25), cos(length(distance) * 20.0));
        }`;
    }
}

